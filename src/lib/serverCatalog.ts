import type { ServerCategory } from './constants';

/**
 * Pre-configured MCP server template
 */
export interface ServerTemplate {
    id: string;
    name: string;
    description: string;
    command: string;
    args: string[];
    category: ServerCategory;
    source: 'official' | 'community';
    documentationUrl?: string;
    iconUrl?: string;
    requiresConfig?: boolean;
    configHint?: string;
}

/**
 * Official reference servers from Anthropic
 */
export const OFFICIAL_SERVERS: ServerTemplate[] = [
    {
        id: 'filesystem',
        name: 'File System',
        description: 'Read and write files with configurable access controls',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        category: 'filesystem',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        requiresConfig: true,
        configHint: 'Add allowed directory paths as additional arguments',
    },
    {
        id: 'git',
        name: 'Git',
        description: 'Read, search, and manipulate Git repositories',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git'],
        category: 'development',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Manage repositories, issues, pull requests, and commits',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        category: 'development',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        requiresConfig: true,
        configHint: 'Requires GITHUB_TOKEN environment variable',
    },
    {
        id: 'fetch',
        name: 'Fetch',
        description: 'Web content fetching and conversion for efficient LLM usage',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-fetch'],
        category: 'api',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    },
    {
        id: 'memory',
        name: 'Memory',
        description: 'Knowledge graph-based persistent memory system',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        category: 'productivity',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    },
    {
        id: 'sequentialthinking',
        name: 'Sequential Thinking',
        description: 'Dynamic problem-solving through thought sequences',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequentialthinking'],
        category: 'productivity',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
    },
    {
        id: 'time',
        name: 'Time',
        description: 'Time and timezone conversion capabilities',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-time'],
        category: 'other',
        source: 'official',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time',
    },
];

/**
 * Popular community servers
 */
export const COMMUNITY_SERVERS: ServerTemplate[] = [
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Query PostgreSQL databases with natural language',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        category: 'database',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
        requiresConfig: true,
        configHint: 'Requires database connection string',
    },
    {
        id: 'sqlite',
        name: 'SQLite',
        description: 'Query local SQLite databases',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sqlite'],
        category: 'database',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        requiresConfig: true,
        configHint: 'Add path to SQLite database file',
    },
    {
        id: 'brave-search',
        name: 'Brave Search',
        description: 'Web search using Brave Search API',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        category: 'api',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        requiresConfig: true,
        configHint: 'Requires BRAVE_API_KEY environment variable',
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer',
        description: 'Browser automation and web scraping',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        category: 'development',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send messages and interact with Slack workspaces',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-slack'],
        category: 'productivity',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
        requiresConfig: true,
        configHint: 'Requires SLACK_BOT_TOKEN environment variable',
    },
    {
        id: 'gdrive',
        name: 'Google Drive',
        description: 'Access and search files in Google Drive',
        command: 'npx',
        args: ['-y', '@anthropic/mcp-server-gdrive'],
        category: 'filesystem',
        source: 'community',
        documentationUrl: 'https://github.com/anthropics/anthropic-quickstarts/tree/main/mcp-servers/gdrive',
        requiresConfig: true,
        configHint: 'Requires Google OAuth credentials',
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Interact with Notion pages and databases',
        command: 'npx',
        args: ['-y', '@notionhq/mcp-server-notion'],
        category: 'productivity',
        source: 'community',
        documentationUrl: 'https://github.com/notionhq/mcp-server-notion',
        requiresConfig: true,
        configHint: 'Requires NOTION_API_KEY environment variable',
    },
    {
        id: 'gitlab',
        name: 'GitLab',
        description: 'Manage GitLab projects, issues, and merge requests',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-gitlab'],
        category: 'development',
        source: 'community',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab',
        requiresConfig: true,
        configHint: 'Requires GITLAB_TOKEN environment variable',
    },
    {
        id: 'linear',
        name: 'Linear',
        description: 'Manage Linear issues and projects',
        command: 'npx',
        args: ['-y', '@anthropic/mcp-server-linear'],
        category: 'productivity',
        source: 'community',
        requiresConfig: true,
        configHint: 'Requires LINEAR_API_KEY environment variable',
    },
    {
        id: 'sentry',
        name: 'Sentry',
        description: 'Access error tracking and performance data from Sentry',
        command: 'npx',
        args: ['-y', '@sentry/mcp-server'],
        category: 'development',
        source: 'community',
        requiresConfig: true,
        configHint: 'Requires SENTRY_AUTH_TOKEN environment variable',
    },
];

/**
 * All available server templates
 */
export const ALL_SERVER_TEMPLATES: ServerTemplate[] = [
    ...OFFICIAL_SERVERS,
    ...COMMUNITY_SERVERS,
];

/**
 * Get server template by ID
 */
export function getServerTemplate(id: string): ServerTemplate | undefined {
    return ALL_SERVER_TEMPLATES.find(s => s.id === id);
}
