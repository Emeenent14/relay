/**
 * MCP Client configuration with real paths and settings
 */
export interface ClientConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** Config file path relative to user home, or absolute */
    configPath: ClientConfigPath;
    configFormat: 'json' | 'jsonc' | 'json5';
    /** Whether this client is fully supported for export */
    supported: boolean;
    platforms: ('windows' | 'macos' | 'linux')[];
    documentationUrl?: string;
    /** Instructions for manual setup if needed */
    setupInstructions?: string;
    /** Config key where MCP servers are stored */
    mcpConfigKey: string;
}

/**
 * Platform-specific config paths
 */
export interface ClientConfigPath {
    windows: string | null;
    macos: string | null;
    linux: string | null;
}

/**
 * Supported MCP clients with real configurations
 */
export const MCP_CLIENTS: ClientConfig[] = [
    {
        id: 'claude-desktop',
        name: 'Claude Desktop',
        description: 'Anthropic\'s official Claude desktop application with full MCP support',
        icon: 'MessageSquare',
        configPath: {
            windows: '%APPDATA%/Claude/claude_desktop_config.json',
            macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
            linux: '~/.config/Claude/claude_desktop_config.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: true,
        platforms: ['windows', 'macos'],
        documentationUrl: 'https://modelcontextprotocol.io/quickstart/user',
        setupInstructions: 'Claude Desktop automatically loads MCP servers from the config file. Restart Claude after making changes.',
    },
    {
        id: 'cursor',
        name: 'Cursor',
        description: 'AI-first code editor based on VS Code with deep AI integration',
        icon: 'MousePointer',
        configPath: {
            windows: '%USERPROFILE%/.cursor/mcp.json',
            macos: '~/.cursor/mcp.json',
            linux: '~/.cursor/mcp.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://docs.cursor.com/context/model-context-protocol',
        setupInstructions: 'Create or edit ~/.cursor/mcp.json with your MCP server configurations.',
    },
    {
        id: 'vscode-copilot',
        name: 'VS Code (Copilot)',
        description: 'Visual Studio Code with GitHub Copilot MCP extension support',
        icon: 'Code',
        configPath: {
            windows: '%APPDATA%/Code/User/settings.json',
            macos: '~/Library/Application Support/Code/User/settings.json',
            linux: '~/.config/Code/User/settings.json',
        },
        configFormat: 'jsonc',
        mcpConfigKey: 'github.copilot.chat.mcp.servers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://code.visualstudio.com/docs/copilot/chat/mcp-servers',
        setupInstructions: 'Add MCP servers to VS Code settings under github.copilot.chat.mcp.servers. Requires GitHub Copilot extension.',
    },
    {
        id: 'continue-dev',
        name: 'Continue.dev',
        description: 'Open-source AI code assistant for VS Code and JetBrains with MCP support',
        icon: 'PlayCircle',
        configPath: {
            windows: '%USERPROFILE%/.continue/config.json',
            macos: '~/.continue/config.json',
            linux: '~/.continue/config.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'experimental.modelContextProtocolServers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://docs.continue.dev/customize/context-providers#mcp',
        setupInstructions: 'Add MCP servers to ~/.continue/config.json under experimental.modelContextProtocolServers array.',
    },
    {
        id: 'claude-code',
        name: 'Claude Code',
        description: 'Anthropic\'s CLI coding assistant with agentic capabilities',
        icon: 'Terminal',
        configPath: {
            windows: '%APPDATA%/Claude/claude_desktop_config.json',
            macos: '~/.claude/claude_code_config.json',
            linux: '~/.claude/claude_code_config.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://docs.anthropic.com/en/docs/claude-code',
        setupInstructions: 'Run `claude mcp add <server-name>` or edit the config file directly.',
    },
    {
        id: 'windsurf',
        name: 'Windsurf',
        description: 'Codeium\'s AI-powered IDE with Cascade flow AI',
        icon: 'Wind',
        configPath: {
            windows: '%USERPROFILE%/.codeium/windsurf/mcp_config.json',
            macos: '~/.codeium/windsurf/mcp_config.json',
            linux: '~/.codeium/windsurf/mcp_config.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://docs.codeium.com/windsurf/mcp',
        setupInstructions: 'Configure MCP servers in Windsurf settings or edit the mcp_config.json file.',
    },
    {
        id: 'zed',
        name: 'Zed',
        description: 'High-performance, multiplayer code editor built in Rust',
        icon: 'Zap',
        configPath: {
            windows: null,
            macos: '~/.config/zed/settings.json',
            linux: '~/.config/zed/settings.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'context_servers',
        supported: false,
        platforms: ['macos', 'linux'],
        documentationUrl: 'https://zed.dev/docs/context-servers',
        setupInstructions: 'Add MCP servers to Zed settings under context_servers key.',
    },
    {
        id: 'cline',
        name: 'Cline',
        description: 'Autonomous AI coding agent for VS Code (formerly Claude Dev)',
        icon: 'Bot',
        configPath: {
            windows: '%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
            macos: '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
            linux: '~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: true,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://github.com/cline/cline#mcp-support',
        setupInstructions: 'Configure MCP servers through Cline extension settings in VS Code.',
    },
    {
        id: '5ire',
        name: '5ire',
        description: 'Open-source, cross-platform desktop AI assistant',
        icon: 'Flame',
        configPath: {
            windows: '%APPDATA%/5ire/mcp.json',
            macos: '~/Library/Application Support/5ire/mcp.json',
            linux: '~/.config/5ire/mcp.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: false,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://github.com/nanbingxyz/5ire',
        setupInstructions: '5ire has built-in MCP server management through its settings UI.',
    },
    {
        id: 'void',
        name: 'Void',
        description: 'Open-source Cursor alternative with full AI control and MCP support',
        icon: 'Circle',
        configPath: {
            windows: '%USERPROFILE%/.void/mcp.json',
            macos: '~/.void/mcp.json',
            linux: '~/.void/mcp.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: false,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://voideditor.com/docs/mcp',
        setupInstructions: 'Configure MCP servers through Void\'s settings interface.',
    },
    {
        id: 'glama',
        name: 'Glama',
        description: 'AI workspace with unified interface to LLM providers',
        icon: 'Sparkles',
        configPath: {
            windows: null,
            macos: null,
            linux: null,
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: false,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://glama.ai/mcp',
        setupInstructions: 'Glama is web-based. Configure MCP servers through the web interface.',
    },
    {
        id: 'msty',
        name: 'Msty',
        description: 'Modern AI chat interface with MCP integration',
        icon: 'MessagesSquare',
        configPath: {
            windows: '%APPDATA%/Msty/mcp_config.json',
            macos: '~/Library/Application Support/Msty/mcp_config.json',
            linux: '~/.config/Msty/mcp_config.json',
        },
        configFormat: 'json',
        mcpConfigKey: 'mcpServers',
        supported: false,
        platforms: ['windows', 'macos', 'linux'],
        documentationUrl: 'https://msty.app',
        setupInstructions: 'Configure MCP servers through Msty\'s built-in settings.',
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
 * Get config path for current platform
 */
export function getClientConfigPath(client: ClientConfig): string | null {
    const platform = getPlatform();
    return client.configPath[platform];
}

/**
 * Get likely config path candidates for clients that have multiple known variants.
 */
export function getClientConfigPathCandidates(client: ClientConfig): string[] {
    const primary = getClientConfigPath(client);
    if (!primary) return [];

    const platform = getPlatform();
    const variants = new Set<string>([primary]);

    if (client.id === 'claude-desktop') {
        if (platform === 'windows') {
            variants.add('%APPDATA%/Claude/claude_desktop_config.json');
            variants.add('%USERPROFILE%/.claude/claude_desktop_config.json');
        } else if (platform === 'macos') {
            variants.add('~/Library/Application Support/Claude/claude_desktop_config.json');
            variants.add('~/.claude/claude_desktop_config.json');
        } else {
            variants.add('~/.config/Claude/claude_desktop_config.json');
            variants.add('~/.claude/claude_desktop_config.json');
        }
    }

    if (client.id === 'cursor') {
        if (platform === 'windows') {
            variants.add('%USERPROFILE%/.cursor/mcp.json');
            variants.add('%APPDATA%/Cursor/User/mcp.json');
            variants.add('%LOCALAPPDATA%/Cursor/User/mcp.json');
        } else if (platform === 'macos') {
            variants.add('~/.cursor/mcp.json');
            variants.add('~/Library/Application Support/Cursor/User/mcp.json');
        } else {
            variants.add('~/.cursor/mcp.json');
            variants.add('$XDG_CONFIG_HOME/Cursor/User/mcp.json');
            variants.add('~/.config/Cursor/User/mcp.json');
        }
    }

    return Array.from(variants);
}

/**
 * Get current platform
 */
export function getPlatform(): 'windows' | 'macos' | 'linux' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    return 'linux';
}

/**
 * Resolve environment variables in path using Tauri backend
 */
export async function resolveConfigPath(path: string): Promise<string> {
    try {
        // Use Tauri command for proper cross-platform path expansion
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<string>('expand_path', { path });
    } catch (error) {
        console.error('Failed to expand path:', error);
        // Fallback: return original path
        return path;
    }
}

/**
 * Default client for export
 */
export const DEFAULT_CLIENT = 'claude-desktop';

/**
 * Generate MCP config object for export
 */
export interface MCPServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

export interface MCPConfig {
    mcpServers: Record<string, MCPServerConfig>;
}
