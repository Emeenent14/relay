import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { CatalogPage } from './components/features/CatalogPage';
import { MarketplacePage } from './components/features/MarketplacePage';
import { InspectorPage } from './components/features/InspectorPage';
import { SettingsPage } from './components/features/settings/SettingsPage';
import { AddServerDialog } from './components/features/servers/AddServerDialog';
import { EditServerDialog } from './components/features/servers/EditServerDialog';
import { DeleteServerDialog } from './components/features/servers/DeleteServerDialog';
import { ServerLogsDialog } from './components/features/servers/ServerLogsDialog';
import { Toaster } from './components/ui/toaster';
import { useUIStore } from './stores/uiStore';
import { useSettingsStore } from './stores/settingsStore';
import { useServerStore } from './stores/serverStore';

function App() {
  const { currentPage } = useUIStore();
  const { fetchSettings } = useSettingsStore();
  const { syncServers } = useServerStore();

  // Load settings (and apply theme) on mount
  useEffect(() => {
    fetchSettings();
    syncServers();
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, [fetchSettings, syncServers]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentPage === 'servers' && <CatalogPage />}
        {currentPage === 'marketplace' && <MarketplacePage />}
        {currentPage === 'inspector' && <InspectorPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* Dialogs */}
      <AddServerDialog />
      <EditServerDialog />
      <DeleteServerDialog />
      <ServerLogsDialog />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
