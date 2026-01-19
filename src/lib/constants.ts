/**
 * Server categories for organization
 */
export const SERVER_CATEGORIES = [
    { value: 'filesystem', label: 'File System' },
    { value: 'database', label: 'Database' },
    { value: 'api', label: 'API' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'development', label: 'Development' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'communication', label: 'Communication' },
    { value: 'search', label: 'Search' },
    { value: 'automation', label: 'Automation' },
    { value: 'other', label: 'Other' },
] as const;

export type ServerCategory = typeof SERVER_CATEGORIES[number]['value'];

/**
 * Theme options
 */
export const THEMES = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
] as const;

export type Theme = typeof THEMES[number]['value'];

/**
 * Category icons (Lucide icon names)
 */
export const CATEGORY_ICONS: Record<ServerCategory, string> = {
    filesystem: 'FolderOpen',
    database: 'Database',
    api: 'Globe',
    productivity: 'Zap',
    development: 'Code',
    cloud: 'Cloud',
    communication: 'MessageSquare',
    search: 'Search',
    automation: 'Bot',
    other: 'Box',
};

/**
 * Category colors for badges
 */
export const CATEGORY_COLORS: Record<ServerCategory, string> = {
    filesystem: 'bg-blue-500/20 text-blue-400',
    database: 'bg-purple-500/20 text-purple-400',
    api: 'bg-green-500/20 text-green-400',
    productivity: 'bg-yellow-500/20 text-yellow-400',
    development: 'bg-orange-500/20 text-orange-400',
    cloud: 'bg-cyan-500/20 text-cyan-400',
    communication: 'bg-pink-500/20 text-pink-400',
    search: 'bg-indigo-500/20 text-indigo-400',
    automation: 'bg-rose-500/20 text-rose-400',
    other: 'bg-gray-500/20 text-gray-400',
};

/**
 * Default command runners
 */
export const COMMAND_RUNNERS = [
    { value: 'npx', label: 'npx (Node.js)' },
    { value: 'node', label: 'node' },
    { value: 'python', label: 'python' },
    { value: 'uvx', label: 'uvx (Python uv)' },
] as const;

export type CommandRunner = typeof COMMAND_RUNNERS[number]['value'];

