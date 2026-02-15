import type { ServerCategory } from './constants';

/**
 * Pre-configured MCP server template with real configurations
 */
// Schema for configuration fields
export interface ConfigField {
    key: string;              // The key in env or args
    label: string;            // User-facing label
    type: 'text' | 'password' | 'path' | 'select';
    default?: string;         // Default value
    placeholder?: string;
    required: boolean;
    description?: string;
    options?: { label: string; value: string }[]; // For select type
}

export interface ServerTemplate {
    id: string;
    name: string;
    description: string;
    command: string;
    args: string[];
    env?: Record<string, string>; // Default env vars
    category: ServerCategory;
    source: 'official' | 'community' | 'reference';
    documentationUrl?: string;
    iconUrl?: string;
    requiresConfig?: boolean;
    configHint?: string;
    packageName?: string;     // npm package name for autodetection/install
    configSchema?: ConfigField[]; // Structured config schema
    verified?: boolean;       // Package verified to exist on npm (false for unverified community servers)
}

// ============================================================================
// REFERENCE SERVERS (from Anthropic/MCP official repo)
// ============================================================================

export const REFERENCE_SERVERS: ServerTemplate[] = [
    {
        id: 'everything',
        name: 'Everything',
        description: 'Reference/test server demonstrating all MCP features: prompts, resources, and tools',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everything'],
        category: 'development',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-everything',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything',
    },
    {
        id: 'filesystem',
        name: 'File System',
        description: 'Secure file operations with configurable access controls. Read, write, and manage files.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        category: 'filesystem',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-filesystem',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        requiresConfig: true,
        configHint: 'Add directories to allow access to',
        configSchema: [
            {
                key: 'args', // Special key to append to args
                label: 'Allowed Directories',
                type: 'path',
                default: '%OS_ROOT%',
                required: true,
                description: 'Directories the server is allowed to access (default: all available)',
            }
        ]
    },
    {
        id: 'fetch',
        name: 'Fetch',
        description: 'Web content fetching and conversion for efficient LLM usage. Retrieves and parses web pages.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-fetch'],
        category: 'api',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-fetch',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    },
    {
        id: 'git',
        name: 'Git',
        description: 'Read, search, and manipulate Git repositories. Supports commits, branches, and diffs.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git', '--repository'],
        category: 'development',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-git',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
        requiresConfig: true,
        configHint: 'Path to local Git repository',
        configSchema: [
            {
                key: 'args', // Append to args
                label: 'Repository Path',
                type: 'path',
                required: true,
                description: 'Path to the local Git repository',
            }
        ]
    },
    {
        id: 'memory',
        name: 'Memory',
        description: 'Knowledge graph-based persistent memory system. Store and retrieve structured data.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        category: 'productivity',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-memory',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    },
    {
        id: 'sequentialthinking',
        name: 'Sequential Thinking',
        description: 'Dynamic and reflective problem-solving through thought sequences.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequentialthinking'],
        category: 'productivity',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-sequentialthinking',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
    },
    {
        id: 'time',
        name: 'Time',
        description: 'Time and timezone conversion capabilities. Get current time in various timezones.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-time'],
        category: 'other',
        source: 'reference',
        verified: true,
        packageName: '@modelcontextprotocol/server-time',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time',
    },
];

// ============================================================================
// OFFICIAL INTEGRATION SERVERS (maintained by companies)
// ============================================================================

export const OFFICIAL_SERVERS: ServerTemplate[] = [
    {
        id: 'github',
        name: 'GitHub',
        description: 'Manage repositories, issues, pull requests, and commits via the GitHub API.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        category: 'development',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-github',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        requiresConfig: true,
        configHint: 'Requires Personal Access Token',
        configSchema: [
            {
                key: 'GITHUB_PERSONAL_ACCESS_TOKEN',
                label: 'Personal Access Token',
                type: 'password',
                required: true,
                description: 'GitHub PAT with repo permissions',
            }
        ]
    },
    {
        id: 'gitlab',
        name: 'GitLab',
        description: 'Manage GitLab projects, issues, merge requests, and pipelines.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-gitlab'],
        env: {
            GITLAB_API_URL: 'https://gitlab.com/api/v4',
        },
        category: 'development',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-gitlab',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab',
        requiresConfig: true,
        configHint: 'Requires Personal Access Token',
        configSchema: [
            {
                key: 'GITLAB_PERSONAL_ACCESS_TOKEN',
                label: 'Personal Access Token',
                type: 'password',
                required: true,
                description: 'GitLab PAT with api permissions',
            },
            {
                key: 'GITLAB_API_URL',
                label: 'API URL',
                type: 'text',
                default: 'https://gitlab.com/api/v4',
                required: false,
                description: 'GitLab instance API URL',
            }
        ]
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Query PostgreSQL databases with natural language. Execute SQL and explore schemas.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        category: 'database',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-postgres',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
        requiresConfig: true,
        configHint: 'Database connection URL required',
        configSchema: [
            {
                key: 'args', // Append to args
                label: 'Connection String',
                type: 'text', // password? usually contains password but looks like URL
                placeholder: 'postgresql://user:password@localhost:5432/db',
                required: true,
                description: 'PostgreSQL connection string',
            }
        ]
    },
    {
        id: 'sqlite',
        name: 'SQLite',
        description: 'Query local SQLite databases. Execute SQL and manage database files.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path'],
        category: 'database',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-sqlite',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        requiresConfig: true,
        configHint: 'Path to database file required',
        configSchema: [
            {
                key: 'args', // Append to args
                label: 'Database Path',
                type: 'path',
                required: true,
                description: 'Absolute path to SQLite database file',
            }
        ]
    },
    {
        id: 'brave-search',
        name: 'Brave Search',
        description: 'Web search using Brave Search API. Privacy-focused search results.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
            BRAVE_API_KEY: '<your-brave-api-key>',
        },
        category: 'api',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-brave-search',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        requiresConfig: true,
        configHint: 'Get API key from https://brave.com/search/api/',
        configSchema: [
            {
                key: 'BRAVE_API_KEY',
                label: 'API Key',
                type: 'password',
                required: true,
                description: 'Brave Search API key from brave.com/search/api',
            }
        ]
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer',
        description: 'Browser automation and web scraping using headless Chrome.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        category: 'automation',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-puppeteer',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send messages and interact with Slack workspaces. Manage channels and users.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-slack'],
        env: {
            SLACK_BOT_TOKEN: '<your-slack-bot-token>',
            SLACK_TEAM_ID: '<your-slack-team-id>',
        },
        category: 'communication',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-slack',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
        requiresConfig: true,
        configHint: 'Create Slack app and get bot token from api.slack.com',
        configSchema: [
            {
                key: 'SLACK_BOT_TOKEN',
                label: 'Bot Token',
                type: 'password',
                required: true,
                description: 'Slack bot token from api.slack.com (starts with xoxb-)',
            },
            {
                key: 'SLACK_TEAM_ID',
                label: 'Team ID',
                type: 'text',
                required: true,
                description: 'Your Slack team/workspace ID',
            }
        ]
    },
    {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Access and search files in Google Drive. Read documents and manage files.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-gdrive'],
        env: {
            GDRIVE_CREDENTIALS_PATH: '/path/to/credentials.json',
        },
        category: 'filesystem',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-gdrive',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive',
        requiresConfig: true,
        configHint: 'Requires Google OAuth credentials JSON from Cloud Console',
        configSchema: [
            {
                key: 'GDRIVE_CREDENTIALS_PATH',
                label: 'Credentials Path',
                type: 'path',
                required: true,
                description: 'Path to Google OAuth credentials JSON file',
            }
        ]
    },
    {
        id: 'google-maps',
        name: 'Google Maps',
        description: 'Location services, directions, and place details using Google Maps API.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-google-maps'],
        env: {
            GOOGLE_MAPS_API_KEY: '<your-google-maps-api-key>',
        },
        category: 'api',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-google-maps',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
        requiresConfig: true,
        configHint: 'Get API key from Google Cloud Console with Maps API enabled',
        configSchema: [
            {
                key: 'GOOGLE_MAPS_API_KEY',
                label: 'API Key',
                type: 'password',
                required: true,
                description: 'Google Maps API key from Google Cloud Console',
            }
        ]
    },
    {
        id: 'sentry',
        name: 'Sentry',
        description: 'Access error tracking and performance data from Sentry. Monitor application issues.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sentry'],
        env: {
            SENTRY_AUTH_TOKEN: '<your-sentry-auth-token>',
            SENTRY_ORG: '<your-sentry-org>',
        },
        category: 'development',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-sentry',
        documentationUrl: 'https://github.com/getsentry/sentry-mcp',
        requiresConfig: true,
        configHint: 'Get auth token from Sentry settings > Developer Settings > Auth Tokens',
        configSchema: [
            {
                key: 'SENTRY_AUTH_TOKEN',
                label: 'Auth Token',
                type: 'password',
                required: true,
                description: 'Sentry auth token from Developer Settings',
            },
            {
                key: 'SENTRY_ORG',
                label: 'Organization',
                type: 'text',
                required: true,
                description: 'Your Sentry organization slug',
            }
        ]
    },
    {
        id: 'cloudflare',
        name: 'Cloudflare',
        description: 'Manage Cloudflare Workers, KV, R2, and D1 resources.',
        command: 'npx',
        args: ['-y', '@cloudflare/mcp-server-cloudflare'],
        env: {
            CLOUDFLARE_API_TOKEN: '<your-cloudflare-api-token>',
            CLOUDFLARE_ACCOUNT_ID: '<your-account-id>',
        },
        category: 'cloud',
        source: 'official',
        verified: true,
        packageName: '@cloudflare/mcp-server-cloudflare',
        documentationUrl: 'https://github.com/cloudflare/mcp-server-cloudflare',
        requiresConfig: true,
        configHint: 'Get API token from Cloudflare dashboard with appropriate permissions',
    },
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Payment processing, customer management, and subscription handling via Stripe API.',
        command: 'npx',
        args: ['-y', '@stripe/mcp'],
        env: {
            STRIPE_SECRET_KEY: '<your-stripe-secret-key>',
        },
        category: 'api',
        source: 'official',
        verified: true,
        packageName: '@stripe/mcp',
        documentationUrl: 'https://github.com/stripe/agent-toolkit',
        requiresConfig: true,
        configHint: 'Use test mode key (sk_test_...) for development',
        configSchema: [
            {
                key: 'STRIPE_SECRET_KEY',
                label: 'Secret Key',
                type: 'password',
                required: true,
                description: 'Stripe secret API key (use sk_test_ for development)',
            }
        ]
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Interact with Notion pages, databases, and blocks. Create and update content.',
        command: 'npx',
        args: ['-y', '@notionhq/notion-mcp-server'],
        env: {
            NOTION_API_KEY: '<your-notion-integration-token>',
        },
        category: 'productivity',
        source: 'official',
        verified: true,
        packageName: '@notionhq/notion-mcp-server',
        documentationUrl: 'https://github.com/makenotion/notion-mcp-server',
        requiresConfig: true,
        configHint: 'Create internal integration at notion.so/my-integrations',
        configSchema: [
            {
                key: 'NOTION_API_KEY',
                label: 'API Key',
                type: 'password',
                required: true,
                description: 'Notion integration token from notion.so/my-integrations',
            }
        ]
    },
    {
        id: 'linear',
        name: 'Linear',
        description: 'Manage Linear issues, projects, and cycles. Track development work.',
        command: 'npx',
        args: ['-y', 'linear-mcp-server'],
        env: {
            LINEAR_API_KEY: '<your-linear-api-key>',
        },
        category: 'productivity',
        source: 'official',
        verified: true,
        packageName: 'linear-mcp-server',
        documentationUrl: 'https://github.com/modelcontextprotocol/linear-server',
        requiresConfig: true,
        configHint: 'Get API key from Linear settings > API',
        configSchema: [
            {
                key: 'LINEAR_API_KEY',
                label: 'API Key',
                type: 'password',
                required: true,
                description: 'Linear API key from settings > API',
            }
        ]
    },
    {
        id: 'aws-kb',
        name: 'AWS Knowledge Base',
        description: 'Retrieve knowledge from AWS Bedrock Knowledge Bases.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-aws-kb-retrieval'],
        env: {
            AWS_ACCESS_KEY_ID: '<your-access-key>',
            AWS_SECRET_ACCESS_KEY: '<your-secret-key>',
            AWS_REGION: 'us-east-1',
        },
        category: 'cloud',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-aws-kb-retrieval',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval',
        requiresConfig: true,
        configHint: 'Requires AWS credentials with Bedrock access',
    },
    {
        id: 'everart',
        name: 'EverArt',
        description: 'AI image generation using various models. Create and edit images.',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-everart'],
        env: {
            EVERART_API_KEY: '<your-everart-api-key>',
        },
        category: 'api',
        source: 'official',
        verified: true,
        packageName: '@modelcontextprotocol/server-everart',
        documentationUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everart',
        requiresConfig: true,
        configHint: 'Get API key from EverArt platform',
    },
    {
        id: 'neon',
        name: 'Neon',
        description: 'Serverless Postgres database operations via Neon platform.',
        command: 'npx',
        args: ['-y', '@neondatabase/mcp-server-neon'],
        env: {
            NEON_API_KEY: '<your-neon-api-key>',
        },
        category: 'database',
        source: 'official',
        verified: true,
        packageName: '@neondatabase/mcp-server-neon',
        documentationUrl: 'https://github.com/neondatabase/mcp-server-neon',
        requiresConfig: true,
        configHint: 'Get API key from Neon console',
    },
    {
        id: 'aiven',
        name: 'Aiven',
        description: 'Navigate Aiven projects and interact with PostgreSQL, Kafka, ClickHouse services.',
        command: 'npx',
        args: ['-y', '@aiven/mcp-server'],
        env: {
            AIVEN_TOKEN: '<your-aiven-token>',
        },
        category: 'database',
        source: 'official',
        verified: true,
        packageName: '@aiven/mcp-server',
        documentationUrl: 'https://github.com/Aiven-Open/mcp-aiven',
        requiresConfig: true,
        configHint: 'Get token from Aiven console > User Information',
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Build, manage, and run Docker containers. List images and manage resources.',
        command: 'npx',
        args: ['-y', '@docker/mcp-server'],
        category: 'development',
        source: 'official',
        verified: true,
        packageName: '@docker/mcp-server',
        documentationUrl: 'https://github.com/docker/mcp-server',
    },
    {
        id: 'twilio',
        name: 'Twilio',
        description: 'SMS, voice, and communication APIs. Send messages and make calls.',
        command: 'npx',
        args: ['-y', '@twilio/mcp-server'],
        env: {
            TWILIO_ACCOUNT_SID: '<your-account-sid>',
            TWILIO_AUTH_TOKEN: '<your-auth-token>',
        },
        category: 'communication',
        source: 'official',
        verified: true,
        packageName: '@twilio/mcp-server',
        documentationUrl: 'https://github.com/twilio/mcp-server-twilio',
        requiresConfig: true,
        configHint: 'Get credentials from Twilio Console',
    },
];

// ============================================================================
// COMMUNITY SERVERS
// ============================================================================

export const COMMUNITY_SERVERS: ServerTemplate[] = [
    // --- Database Servers ---
    {
        id: 'mongodb',
        name: 'MongoDB',
        description: 'Query and manage MongoDB databases. CRUD operations and aggregations.',
        command: 'npx',
        args: ['-y', 'mcp-server-mongodb', '--uri', 'mongodb://localhost:27017/database'],
        category: 'database',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-mongodb',
        documentationUrl: 'https://github.com/mongodb-js/mcp-server-mongodb',
        requiresConfig: true,
        configHint: 'Replace MongoDB URI with your connection string',
    },
    {
        id: 'mysql',
        name: 'MySQL',
        description: 'Query MySQL and MariaDB databases. Execute SQL and explore schemas.',
        command: 'npx',
        args: ['-y', 'mcp-server-mysql'],
        env: {
            MYSQL_HOST: 'localhost',
            MYSQL_PORT: '3306',
            MYSQL_USER: '<username>',
            MYSQL_PASSWORD: '<password>',
            MYSQL_DATABASE: '<database>',
        },
        category: 'database',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-mysql',
        documentationUrl: 'https://github.com/benborber/mcp-server-mysql',
        requiresConfig: true,
        configHint: 'Set MySQL connection environment variables',
    },
    {
        id: 'redis',
        name: 'Redis',
        description: 'Redis database operations. Key-value storage, caching, and pub/sub.',
        command: 'npx',
        args: ['-y', 'mcp-server-redis', '--url', 'redis://localhost:6379'],
        category: 'database',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-redis',
        documentationUrl: 'https://github.com/redis/mcp-server-redis',
        requiresConfig: true,
        configHint: 'Replace Redis URL with your connection string',
    },
    {
        id: 'elasticsearch',
        name: 'Elasticsearch',
        description: 'Elasticsearch queries and operations. Full-text search and analytics.',
        command: 'npx',
        args: ['-y', 'mcp-server-elasticsearch'],
        env: {
            ELASTICSEARCH_URL: 'http://localhost:9200',
            ELASTICSEARCH_API_KEY: '<optional-api-key>',
        },
        category: 'database',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-elasticsearch',
        documentationUrl: 'https://github.com/elastic/mcp-server-elasticsearch',
        requiresConfig: true,
        configHint: 'Set Elasticsearch URL and optional API key',
    },
    {
        id: 'clickhouse',
        name: 'ClickHouse',
        description: 'High-performance analytics database. OLAP queries and data analysis.',
        command: 'npx',
        args: ['-y', 'mcp-server-clickhouse'],
        env: {
            CLICKHOUSE_URL: 'http://localhost:8123',
            CLICKHOUSE_USER: 'default',
            CLICKHOUSE_PASSWORD: '',
        },
        category: 'database',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-clickhouse',
        documentationUrl: 'https://github.com/ClickHouse/mcp-server-clickhouse',
        requiresConfig: true,
        configHint: 'Set ClickHouse connection details',
    },

    // --- Productivity Servers ---
    {
        id: 'jira',
        name: 'Jira',
        description: 'Manage Jira issues, projects, and sprints. Atlassian integration.',
        command: 'npx',
        args: ['-y', 'mcp-server-jira'],
        env: {
            JIRA_HOST: 'https://your-domain.atlassian.net',
            JIRA_EMAIL: '<your-email>',
            JIRA_API_TOKEN: '<your-jira-api-token>',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-jira',
        documentationUrl: 'https://github.com/sooperset/mcp-atlassian',
        requiresConfig: true,
        configHint: 'Get API token from id.atlassian.com/manage-profile/security/api-tokens',
    },
    {
        id: 'confluence',
        name: 'Confluence',
        description: 'Access Confluence wiki pages and spaces. Atlassian integration.',
        command: 'npx',
        args: ['-y', 'mcp-server-confluence'],
        env: {
            CONFLUENCE_HOST: 'https://your-domain.atlassian.net',
            CONFLUENCE_EMAIL: '<your-email>',
            CONFLUENCE_API_TOKEN: '<your-confluence-api-token>',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-confluence',
        documentationUrl: 'https://github.com/sooperset/mcp-atlassian',
        requiresConfig: true,
        configHint: 'Same API token as Jira works for Confluence',
    },
    {
        id: 'trello',
        name: 'Trello',
        description: 'Manage Trello boards, lists, and cards. Kanban project management.',
        command: 'npx',
        args: ['-y', 'mcp-server-trello'],
        env: {
            TRELLO_API_KEY: '<your-api-key>',
            TRELLO_TOKEN: '<your-trello-token>',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-trello',
        documentationUrl: 'https://github.com/cktang88/mcp-server-trello',
        requiresConfig: true,
        configHint: 'Get API key from trello.com/power-ups/admin/new',
    },
    {
        id: 'todoist',
        name: 'Todoist',
        description: 'Manage Todoist tasks, projects, and labels. Personal task management.',
        command: 'npx',
        args: ['-y', 'mcp-server-todoist'],
        env: {
            TODOIST_API_TOKEN: '<your-todoist-api-token>',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-todoist',
        documentationUrl: 'https://github.com/abhiz123/todoist-mcp-server',
        requiresConfig: true,
        configHint: 'Get API token from Todoist Settings > Integrations > Developer',
    },
    {
        id: 'obsidian',
        name: 'Obsidian',
        description: 'Access and search Obsidian vault notes. Local markdown knowledge base.',
        command: 'npx',
        args: ['-y', 'mcp-server-obsidian', '--vault', '/path/to/your/vault'],
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-obsidian',
        documentationUrl: 'https://github.com/smithery-ai/mcp-obsidian',
        requiresConfig: true,
        configHint: 'Replace with path to your Obsidian vault folder',
    },
    {
        id: 'google-sheets',
        name: 'Google Sheets',
        description: 'Read and write Google Sheets spreadsheets. Data manipulation and analysis.',
        command: 'npx',
        args: ['-y', 'mcp-server-google-sheets'],
        env: {
            GOOGLE_SHEETS_CREDENTIALS_PATH: '/path/to/credentials.json',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-google-sheets',
        documentationUrl: 'https://github.com/nicobrenner/mcp-google-sheets',
        requiresConfig: true,
        configHint: 'Requires Google OAuth credentials with Sheets API enabled',
    },
    {
        id: 'airtable',
        name: 'Airtable',
        description: 'Airtable database operations. Spreadsheet-database hybrid.',
        command: 'npx',
        args: ['-y', 'mcp-server-airtable'],
        env: {
            AIRTABLE_API_KEY: '<your-api-key>',
        },
        category: 'productivity',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-airtable',
        documentationUrl: 'https://github.com/domdomegg/airtable-mcp-server',
        requiresConfig: true,
        configHint: 'Get API key from airtable.com/create/tokens',
    },

    // --- API & Search Servers ---
    {
        id: 'youtube',
        name: 'YouTube',
        description: 'Search and access YouTube video content. Get transcripts and metadata.',
        command: 'npx',
        args: ['-y', 'mcp-server-youtube'],
        env: {
            YOUTUBE_API_KEY: '<your-api-key>',
        },
        category: 'search',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-youtube',
        documentationUrl: 'https://github.com/kstonekuan/mcp-youtube',
        requiresConfig: true,
        configHint: 'Get API key from Google Cloud Console with YouTube Data API enabled',
    },
    {
        id: 'hackernews',
        name: 'Hacker News',
        description: 'Access Hacker News stories, comments, and discussions. Tech news.',
        command: 'npx',
        args: ['-y', 'mcp-server-hackernews'],
        category: 'search',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-hackernews',
        documentationUrl: 'https://github.com/erithwik/mcp-hackernews',
    },
    {
        id: 'wikipedia',
        name: 'Wikipedia',
        description: 'Search and retrieve Wikipedia content. Encyclopedic knowledge base.',
        command: 'npx',
        args: ['-y', 'mcp-server-wikipedia'],
        category: 'search',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-wikipedia',
        documentationUrl: 'https://github.com/calclavia/mcp-wikipedia',
    },
    {
        id: 'arxiv',
        name: 'arXiv',
        description: 'Search academic papers on arXiv. Scientific research papers.',
        command: 'npx',
        args: ['-y', 'mcp-server-arxiv'],
        category: 'search',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-arxiv',
        documentationUrl: 'https://github.com/blazickjp/arxiv-mcp-server',
    },
    {
        id: 'firecrawl',
        name: 'Firecrawl',
        description: 'Web scraping with intelligent parsing. Extract clean content from web pages.',
        command: 'npx',
        args: ['-y', 'firecrawl-mcp'],
        env: {
            FIRECRAWL_API_KEY: '<your-api-key>',
        },
        category: 'api',
        source: 'community',
        verified: false,
        packageName: 'firecrawl-mcp',
        documentationUrl: 'https://github.com/firecrawl/mcp-server-firecrawl',
        requiresConfig: true,
        configHint: 'Get API key from firecrawl.dev',
    },
    {
        id: 'exa',
        name: 'Exa',
        description: 'AI-powered neural search for the web. Semantic search engine.',
        command: 'npx',
        args: ['-y', 'mcp-server-exa'],
        env: {
            EXA_API_KEY: '<your-api-key>',
        },
        category: 'search',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-exa',
        documentationUrl: 'https://github.com/exa-labs/exa-mcp-server',
        requiresConfig: true,
        configHint: 'Get API key from exa.ai',
    },

    // --- Development & Automation Servers ---
    {
        id: 'playwright',
        name: 'Playwright',
        description: 'Browser automation and testing. Cross-browser testing and scraping.',
        command: 'npx',
        args: ['-y', '@anthropic/mcp-server-playwright'],
        category: 'automation',
        source: 'community',
        verified: false,
        packageName: '@anthropic/mcp-server-playwright',
        documentationUrl: 'https://github.com/anthropics/anthropic-quickstarts/tree/main/mcp-servers/playwright',
    },
    {
        id: 'browserbase',
        name: 'Browserbase',
        description: 'Cloud browser automation. Headless browser infrastructure.',
        command: 'npx',
        args: ['-y', '@browserbasehq/mcp-server-browserbase'],
        env: {
            BROWSERBASE_API_KEY: '<your-api-key>',
            BROWSERBASE_PROJECT_ID: '<your-project-id>',
        },
        category: 'automation',
        source: 'community',
        verified: false,
        packageName: '@browserbasehq/mcp-server-browserbase',
        documentationUrl: 'https://github.com/browserbase/mcp-server-browserbase',
        requiresConfig: true,
        configHint: 'Get API key and project ID from browserbase.com',
    },
    {
        id: 'e2b',
        name: 'E2B',
        description: 'Execute code in sandboxed cloud environments. Secure code execution.',
        command: 'npx',
        args: ['-y', '@e2b/mcp-server'],
        env: {
            E2B_API_KEY: '<your-api-key>',
        },
        category: 'development',
        source: 'community',
        verified: false,
        packageName: '@e2b/mcp-server',
        documentationUrl: 'https://github.com/e2b-dev/mcp-server',
        requiresConfig: true,
        configHint: 'Get API key from e2b.dev',
    },
    {
        id: 'raygun',
        name: 'Raygun',
        description: 'Error tracking and performance monitoring. Application observability.',
        command: 'npx',
        args: ['-y', 'mcp-server-raygun'],
        env: {
            RAYGUN_API_TOKEN: '<your-pat-token>',
        },
        category: 'development',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-raygun',
        documentationUrl: 'https://github.com/MindscapeHQ/mcp-server-raygun',
        requiresConfig: true,
        configHint: 'Get PAT from Raygun > User Menu > My Settings',
    },

    // --- Communication Servers ---
    {
        id: 'discord',
        name: 'Discord',
        description: 'Discord bot and server management. Send messages and manage channels.',
        command: 'npx',
        args: ['-y', 'mcp-server-discord'],
        env: {
            DISCORD_BOT_TOKEN: '<your-bot-token>',
        },
        category: 'communication',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-discord',
        documentationUrl: 'https://github.com/v-3/discordmcp',
        requiresConfig: true,
        configHint: 'Create bot and get token from discord.com/developers/applications',
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Telegram bot integration. Send and receive messages.',
        command: 'npx',
        args: ['-y', 'mcp-server-telegram'],
        env: {
            TELEGRAM_BOT_TOKEN: '<your-bot-token>',
        },
        category: 'communication',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-telegram',
        documentationUrl: 'https://github.com/nicosola/telegram-mcp-server',
        requiresConfig: true,
        configHint: 'Get bot token from @BotFather on Telegram',
    },
    {
        id: 'twitter',
        name: 'Twitter/X',
        description: 'Twitter/X API access. Post tweets and interact with the platform.',
        command: 'npx',
        args: ['-y', 'mcp-server-twitter'],
        env: {
            TWITTER_CONSUMER_KEY: '<consumer-key>',
            TWITTER_CONSUMER_SECRET: '<consumer-secret>',
            TWITTER_ACCESS_TOKEN: '<access-token>',
            TWITTER_ACCESS_TOKEN_SECRET: '<access-token-secret>',
        },
        category: 'communication',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-twitter',
        documentationUrl: 'https://github.com/EnesCinr/twitter-mcp',
        requiresConfig: true,
        configHint: 'Get API keys from developer.twitter.com',
    },
    {
        id: 'bluesky',
        name: 'Bluesky',
        description: 'Bluesky social network integration. Post and interact.',
        command: 'npx',
        args: ['-y', 'mcp-server-bluesky'],
        env: {
            BLUESKY_HANDLE: '<your-handle.bsky.social>',
            BLUESKY_APP_PASSWORD: '<app-password>',
        },
        category: 'communication',
        source: 'community',
        verified: false,
        packageName: 'mcp-server-bluesky',
        documentationUrl: 'https://github.com/keturiosakys/bluesky-context-server',
        requiresConfig: true,
        configHint: 'Create app password in Bluesky Settings > App Passwords',
    },
];

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All available server templates organized by source
 */
export const ALL_SERVER_TEMPLATES: ServerTemplate[] = [
    ...REFERENCE_SERVERS,
    ...OFFICIAL_SERVERS,
    ...COMMUNITY_SERVERS,
];

/**
 * Get server template by ID
 */
export function getServerTemplate(id: string): ServerTemplate | undefined {
    return ALL_SERVER_TEMPLATES.find(s => s.id === id);
}

/**
 * Get servers by category
 */
export function getServersByCategory(category: ServerCategory): ServerTemplate[] {
    return ALL_SERVER_TEMPLATES.filter(s => s.category === category);
}

/**
 * Get servers by source
 */
export function getServersBySource(source: 'reference' | 'official' | 'community'): ServerTemplate[] {
    return ALL_SERVER_TEMPLATES.filter(s => s.source === source);
}
