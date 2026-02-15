import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import { toast } from './components/ui/use-toast';
import { ToastAction } from './components/ui/toast';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { CatalogPage } from './components/features/CatalogPage';
import { MarketplacePage } from './components/features/MarketplacePage';
import { InspectorPage } from './components/features/InspectorPage';
import { SettingsPage } from './components/features/settings/SettingsPage';
import { AddServerDialog } from './components/features/servers/AddServerDialog';
import { DeleteServerDialog } from './components/features/servers/DeleteServerDialog';
import { ServerLogsDialog } from './components/features/servers/ServerLogsDialog';
import { Toaster } from './components/ui/toaster';
import { useUIStore } from './stores/uiStore';
import { useSettingsStore } from './stores/settingsStore';
import { useServerStore } from './stores/serverStore';
import { useProfileStore } from './stores/profileStore';

import { ServerDetailsPage } from './components/features/servers/ServerDetailsPage';
import { AppTour } from './components/features/onboarding/AppTour';

function App() {
  const { currentPage } = useUIStore();
  const { fetchSettings } = useSettingsStore();
  const { syncServers } = useServerStore();
  const { fetchProfiles } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings (and apply theme) on mount
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchSettings(), fetchProfiles()]);
      await syncServers();
      // Set dark mode by default
      document.documentElement.classList.add('dark');
      setIsInitialized(true);

      // Check for updates
      try {
        const update = await invoke<{ update_available: boolean; remote_version: string; url: string }>('check_update');
        if (update.update_available) {
          toast({
            title: "Update Available",
            description: `A new version (v${update.remote_version}) is available.`,
            action: (
              <ToastAction altText="Download" onClick={() => open(update.url)}>
                Download
              </ToastAction>
            ),
            duration: 10000,
          });
        }
      } catch (e) {
        console.error('Failed to check for updates', e);
      }
    };
    initialize();
  }, [fetchProfiles, fetchSettings, syncServers]);

  const handleLoadComplete = () => {
    if (isInitialized) {
      setIsLoading(false);
    }
  };

  // Wait for both loading animation and initialization
  useEffect(() => {
    if (isInitialized && !isLoading) {
      // App is ready
    }
  }, [isInitialized, isLoading]);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen
          onLoadComplete={handleLoadComplete}
          minDisplayTime={2000}
        />
      )}

      {/* Main App - rendered but hidden during loading */}
      <div className={`flex h-screen bg-background text-foreground transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {currentPage === 'servers' && <CatalogPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}
          {currentPage === 'inspector' && <InspectorPage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'server-details' && <ServerDetailsPage />}
        </main>

        {/* Dialogs */}
        <AddServerDialog />
        <DeleteServerDialog />
        <ServerLogsDialog />

        {/* Onboarding Tour */}
        <AppTour />

        {/* Toast notifications */}
        <Toaster />
      </div>
    </>
  );
}

export default App;

