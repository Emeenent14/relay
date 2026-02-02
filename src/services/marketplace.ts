export interface MarketplaceServer {
    id: string;
    name: string;
    description: string;
    command: string;
    args: string[];
    envVariables: string[];
    author: string;
    sourceUrl: string;
    category: string;
    iconUrl?: string;
}

const FALLBACK_SERVERS: MarketplaceServer[] = [
    {
        id: 'markitdown',
        name: 'MarkItDown',
        description: 'Convert various file types (PDF, Word, etc.) into Markdown for LLM usage.',
        command: 'npx',
        args: ['-y', 'markitdown'],
        envVariables: [],
        author: 'Microsoft',
        sourceUrl: 'https://github.com/microsoft/markitdown',
        category: 'Utility',
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Enable AI assistants to interact with the Notion API for managing content.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-notion'],
        envVariables: ['NOTION_API_KEY'],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Collaboration',
    },
    {
        id: 'brave-search',
        name: 'Brave Search',
        description: 'Comprehensive web search and AI-powered summarization.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        envVariables: ['BRAVE_SEARCH_API_KEY'],
        author: 'Brave',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Search',
    },
    {
        id: 'filesystem',
        name: 'FileSystem',
        description: 'Provides tools to read/write files and list directories. Useful for local automation.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        envVariables: [],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Development',
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Read and write access to PostgreSQL databases. Connect to your database seamlessly.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        envVariables: ['DATABASE_URL'],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Database',
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Interact with GitHub repositories, issues, and PRs. Full access to your dev workflow.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        envVariables: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Collaboration',
    },
    {
        id: 'everything',
        name: 'Everything Server',
        description: 'A test server that provides a bit of everything: tools, resources, and samples.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everything'],
        envVariables: [],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Development',
    },
    {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Access and search your Google Drive files directly.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-google-drive'],
        envVariables: ['GOOGLE_DRIVE_CREDENTIALS'],
        author: 'Community',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Storage',
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Read messages and post to Slack channels.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-slack'],
        envVariables: ['SLACK_BOT_TOKEN'],
        author: 'Community',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'Collaboration',
    },
    {
        id: 'sequentialthinker',
        name: 'Sequential Thinker',
        description: 'Assists LLMs in step-by-step reasoning and complex problem solving.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequentialthinker'],
        envVariables: [],
        author: 'Anthropic',
        sourceUrl: 'https://github.com/modelcontextprotocol/servers',
        category: 'AI',
    }
    // ... adding more programmatically or in batches in implementation
];

export const marketplaceService = {
    async fetchServers(query: string = '', page: number = 1): Promise<MarketplaceServer[]> {
        const results: MarketplaceServer[] = [];

        // Add fallbacks only on the first page if they match the query
        if (page === 1) {
            results.push(...FALLBACK_SERVERS.filter(s =>
                s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.description.toLowerCase().includes(query.toLowerCase())
            ));
        }

        try {
            // Fetch from unofficial but comprehensive community sources
            // This is a proxy to get more servers
            const githubQuery = query ? `${query} mcp server` : 'topic:mcp-server';
            const response = await fetch(
                `https://api.github.com/search/repositories?q=${encodeURIComponent(githubQuery)}&sort=stars&order=desc&per_page=30&page=${page}`
            );

            if (response.ok) {
                const data = await response.json();
                const externalServers = (data.items || []).map((repo: any) => ({
                    id: repo.full_name,
                    name: repo.name,
                    description: repo.description || 'No description provided.',
                    command: 'npx',
                    args: ['-y', repo.full_name], // Heuristic guess
                    envVariables: [],
                    author: repo.owner.login,
                    sourceUrl: repo.html_url,
                    category: repo.topics?.includes('database') ? 'Database' : 'Development',
                    iconUrl: repo.owner.avatar_url,
                }));

                externalServers.forEach((ext: MarketplaceServer) => {
                    if (!results.find(res => res.id === ext.id)) {
                        results.push(ext);
                    }
                });
            }
        } catch (error) {
            console.warn('Marketplace fetch error:', error);
        }

        return results;
    }
};
