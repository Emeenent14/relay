/**
 * MCP Client configuration
 */
export interface ClientConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    configPath: string | null;  // null = requires platform detection
    configFormat: 'json' | 'json5';
    supported: boolean;
    platforms: ('windows' | 'macos' | 'linux')[];
    documentationUrl?: string;
}

/**
 * Supported MCP clients
 */
export const MCP_CLIENTS: ClientConfig[] = [
    {
        id: 'claude-desktop',
        name: 'Claude Desktop',
        description: 'Anthropic\'s official Claude desktop application',
        icon: 'MessageSquare',
        configPath: null, // Detected at runtime based on OS
        configFormat: 'json',
        supported: true,
        platforms: ['windows', 'macos'],
        documentationUrl: 'https://claude.ai/download',
    },
    {
        id: 'cursor',
        name: 'Cursor',
        description: 'AI-first code editor based on VS Code',
        icon: 'MousePointer',
        configPath: '.cursor/mcp.json',
        configFormat: 'json',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://cursor.sh',
    },
    {
        id: 'vscode',
        name: 'VS Code',
        description: 'Visual Studio Code with MCP extension',
        icon: 'Code',
        configPath: null, // Via settings.json
        configFormat: 'json',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://code.visualstudio.com/docs/copilot/chat/mcp-servers',
    },
    {
        id: 'windsurf',
        name: 'Windsurf',
        description: 'Codeium\'s AI-powered IDE',
        icon: 'Wind',
        configPath: null,
        configFormat: 'json',
        supported: false, // Future support
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://codeium.com/windsurf',
    },
    {
        id: 'zed',
        name: 'Zed',
        description: 'High-performance code editor built in Rust',
        icon: 'Zap',
        configPath: null,
        configFormat: 'json',
        supported: false, // Future support
        platforms: ['macos', 'linux'],
        documentationUrl: 'https://zed.dev',
    },
    {
        id: 'cline',
        name: 'Cline',
        description: 'AI coding assistant VS Code extension',
        icon: 'Terminal',
        configPath: null,
        configFormat: 'json',
        supported: false, // Future support
        platforms: ['windows', 'macos', 'linux'],
    },
];

/**
 * Get supported clients only
 */
export function getSupportedClients(): ClientConfig[] {
    return MCP_CLIENTS.filter(c => c.supported);
}

/**
 * Get client by ID
 */
export function getClient(id: string): ClientConfig | undefined {
    return MCP_CLIENTS.find(c => c.id === id);
}

/**
 * Default client for export
 */
export const DEFAULT_CLIENT = 'claude-desktop';
