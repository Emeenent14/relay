import { create } from 'zustand';
import { settingsApi } from '../lib/tauri';
import type { AppSettings } from '../types/settings';

interface SettingsState {
    settings: AppSettings;
    loading: boolean;
    error: string | null;

    // Actions
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
    setTheme: (theme: string) => Promise<void>;
    setAutoExport: (autoExport: boolean) => Promise<void>;
}

const defaultSettings: AppSettings = {
    theme: 'dark',
    autoExport: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: defaultSettings,
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
            const settings = await settingsApi.get();
            set({ settings, loading: false });
            // Apply theme
            applyTheme(settings.theme);
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings: AppSettings = {
            ...currentSettings,
            ...newSettings,
        };

        set({ error: null });
        try {
            await settingsApi.update(updatedSettings);
            set({ settings: updatedSettings });
            applyTheme(updatedSettings.theme);
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    setTheme: async (theme) => {
        await get().updateSettings({ theme });
    },

    setAutoExport: async (autoExport) => {
        await get().updateSettings({ autoExport });
    },
}));

/**
 * Apply theme to document
 */
function applyTheme(theme: string) {
    const root = document.documentElement;

    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
}
