import type { CommandRunner } from '../lib/constants';

/**
 * App settings from database
 */
export interface AppSettings {
    // Appearance
    theme: 'light' | 'dark' | 'system';

    // Export settings
    autoExport: boolean;
    defaultExportClient: string;

    // Command settings
    defaultRunner: CommandRunner;

    // Startup settings
    startMinimized: boolean;

    // Behavior settings
    confirmBeforeDelete: boolean;
    showEnvVarsInLogs: boolean;

    // Notification settings
    notificationsEnabled: boolean;

    // Server health check
    healthCheckEnabled: boolean;
    healthCheckInterval: number; // in minutes
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    autoExport: false,
    defaultExportClient: 'claude-desktop',
    defaultRunner: 'npx',
    startMinimized: false,
    confirmBeforeDelete: true,
    showEnvVarsInLogs: false,
    notificationsEnabled: true,
    healthCheckEnabled: false,
    healthCheckInterval: 30,
};

/**
 * Setting descriptions for UI
 */
export const SETTING_DESCRIPTIONS: Record<keyof AppSettings, string> = {
    theme: 'Select your preferred color scheme',
    autoExport: 'Automatically export config when servers change',
    defaultExportClient: 'Default client for quick export actions',
    defaultRunner: 'Default command runner for new servers',
    startMinimized: 'Start Relay minimized to system tray',
    confirmBeforeDelete: 'Show confirmation dialog when deleting servers',
    showEnvVarsInLogs: 'Show environment variable values in log output',
    notificationsEnabled: 'Show desktop notifications for important events',
    healthCheckEnabled: 'Periodically check if MCP servers are running',
    healthCheckInterval: 'How often to check server health (in minutes)',
};
