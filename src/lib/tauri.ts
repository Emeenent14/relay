import { invoke } from '@tauri-apps/api/core';
import type { Server, CreateServerInput, UpdateServerInput } from '../types/server';
import type { AppSettings } from '../types/settings';
import type { Profile } from '../types/profile';
import type { ConnectionTestResult, DependencyCheckInput, DependencyIssue, TestConnectionInput } from '../types/diagnostics';

/**
 * Server API - CRUD operations for MCP servers
 */
export const serverApi = {
    /** Get all servers */
    getAll: () => invoke<Server[]>('get_servers'),

    /** Sync all servers */
    sync: () => invoke<void>('sync_servers'),

    /** Get a single server by ID */
    getOne: (id: string) => invoke<Server>('get_server', { id }),

    /** Create a new server */
    create: (input: CreateServerInput) => invoke<Server>('create_server', { input }),

    /** Update an existing server */
    update: (input: UpdateServerInput) => invoke<Server>('update_server', { input }),

    /** Delete a server */
    delete: (id: string) => invoke<void>('delete_server', { id }),

    /** Toggle server enabled/disabled */
    toggle: (id: string) => invoke<Server>('toggle_server', { id }),
};

/**
 * Config API - Export configuration to Claude and other clients
 */
export const configApi = {
    /** Get Claude Desktop config path */
    getPath: () => invoke<string>('get_config_path'),

    /** Export enabled servers to Claude Desktop */
    exportToClaude: () => invoke<string>('export_to_claude'),

    /** Export config for a specific client */
    exportToClient: (clientId: string) => invoke<string>('export_config', { clientId }),

    /** Export config to a specific path */
    exportToPath: (path: string, key: string) => invoke<string>('export_config_to_path', { path, key }),

    /** Read current Claude Desktop config */
    readClaude: () => invoke<Record<string, unknown>>('read_claude_config'),
};

/**
 * Settings API - App configuration
 */
export const settingsApi = {
    /** Get all settings */
    get: () => invoke<AppSettings>('get_settings'),

    /** Update all settings */
    update: (settings: AppSettings) => invoke<AppSettings>('update_settings', { settings }),

    /** Get a single setting value */
    getSingle: (key: string) => invoke<string>('get_setting', { key }),

    /** Update a single setting */
    updateSingle: (key: string, value: string) => invoke<void>('update_setting', { key, value }),
};

/**
 * Profiles API - grouped server sets
 */
export const profileApi = {
    /** List available profiles */
    getAll: () => invoke<Profile[]>('get_profiles'),

    /** Create a new profile */
    create: (name: string) => invoke<Profile>('create_profile', { name }),

    /** Get currently active profile id */
    getActive: () => invoke<string>('get_active_profile'),

    /** Switch active profile */
    setActive: (profileId: string) => invoke<string>('set_active_profile', { profileId }),
};

/**
 * Diagnostics API - dependency checks and connection validation
 */
export const diagnosticsApi = {
    checkDependencies: (input: DependencyCheckInput) =>
        invoke<DependencyIssue[]>('check_server_dependencies', { input }),

    testConnection: (input: TestConnectionInput) =>
        invoke<ConnectionTestResult>('test_server_connection', { input }),
};
