/**
 * Server entity from database
 */
export interface Server {
    id: string;
    name: string;
    description: string | null;
    command: string;
    args: string;  // JSON string array
    env: string;   // JSON object string
    enabled: boolean;
    status: 'running' | 'stopped';
    category: string;
    source: string;
    marketplace_id: string | null;
    icon_url: string | null;
    documentation_url: string | null;
    secrets: string; // JSON string array of secret keys
    created_at: string;
    updated_at: string;
}

/**
 * Input for creating a new server
 */
export interface CreateServerInput {
    name: string;
    description?: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    secrets?: string[];
    category?: string;
    marketplace_id?: string;
}

/**
 * Input for updating an existing server
 */
export interface UpdateServerInput {
    id: string;
    name?: string;
    description?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    secrets?: string[];
    enabled?: boolean;
    category?: string;
}

/**
 * Parse server args from JSON string
 */
export function parseServerArgs(server: Server): string[] {
    try {
        return JSON.parse(server.args);
    } catch {
        return [];
    }
}

/**
 * Parse server env from JSON string
 */
export function parseServerEnv(server: Server): Record<string, string> {
    try {
        return JSON.parse(server.env);
    } catch {
        return {};
    }
}

/**
 * Parse server secrets list from JSON string
 */
export function parseServerSecrets(server: Server): string[] {
    try {
        return JSON.parse(server.secrets);
    } catch {
        return [];
    }
}
