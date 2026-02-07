import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from 'fs';
import path from 'path';

// Config path - manageable via env var or default
const CONFIG_PATH = process.env.RELAY_CONFIG_PATH || path.join(process.cwd(), 'relay.json');

// Interface for Relay Config
interface RelayServerConfig {
    id: string;
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    disabled?: boolean;
}

interface RelayConfig {
    servers: RelayServerConfig[];
}

// Store active clients
const clients = new Map<string, { client: Client; server: RelayServerConfig }>();

async function main() {
    console.error(`Starting Relay Gateway... reading config from ${CONFIG_PATH}`);

    if (!fs.existsSync(CONFIG_PATH)) {
        console.error("Config file not found.");
        process.exit(1);
    }

    const config: RelayConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    const server = new Server(
        {
            name: "Relay Gateway",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        }
    );

    // Initialize sub-servers
    for (const srv of config.servers) {
        if (srv.disabled) continue;

        // Auto-configure File System if args are missing permissions
        if (srv.name === 'File System') {
            const hasPath = srv.args.some(arg =>
                !arg.startsWith('-') &&
                !arg.startsWith('@')
            );

            if (!hasPath) {
                const isWindows = process.platform === 'win32';
                const root = isWindows ? 'C:\\' : '/';
                console.error(`[Relay] Auto-configuring File System access to ${root}`);
                srv.args.push(root);
            }
        }

        try {
            console.error(`[Relay] Connecting to ${srv.name}...`);
            const transport = new StdioClientTransport({
                command: srv.command,
                args: srv.args,
                env: { ...process.env as Record<string, string>, ...srv.env }, // Inherit env + override
            });

            const client = new Client(
                { name: `relay-${srv.id}`, version: "1.0.0" },
                { capabilities: {} }
            );

            await client.connect(transport);
            clients.set(srv.id, { client, server: srv });
            console.error(`[Relay] Connected to ${srv.name}`);
        } catch (e) {
            console.error(`[Relay] Failed to connect to ${srv.name}:`, e);
        }
    }

    // Aggregation Logic

    // Helper to sanitize server names for tool prefixes
    const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_');

    // List Tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const allTools: any[] = [];
        for (const [, connection] of clients.entries()) {
            try {
                const result = await connection.client.listTools();
                // Namespace capabilities? Or just merge?
                // Merging might cause collisions. Ideally we prefix: "serverName_toolName"
                // For now, let's prefix to be safe: "serverName__toolName"
                const prefix = sanitize(connection.server.name);
                const tools = result.tools.map(t => ({
                    ...t,
                    name: `${prefix}_${t.name}`, // Prefixing with sanitized name
                    description: `[${connection.server.name}] ${t.description || ''}`
                }));
                allTools.push(...tools);
            } catch (e) {
                console.error(`Failed to list tools for ${connection.server.name}`, e);
            }
        }
        return { tools: allTools };
    });

    // Call Tool
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const fullToolName = request.params.name;
        // Parse server name from tool name
        // Format: serverName_toolName (Problem: server name might have underscores?)
        // Let's assume first underscore is separator? Or better, find matching prefix.

        let targetServerId: string | null = null;
        let realToolName = "";

        // Simple heuristic: Try to match server name prefix
        for (const [id, conn] of clients.entries()) {
            const prefix = `${sanitize(conn.server.name)}_`;
            if (fullToolName.startsWith(prefix)) {
                targetServerId = id;
                realToolName = fullToolName.slice(prefix.length);
                break;
            }
        }

        if (!targetServerId) {
            throw new Error(`Tool ${fullToolName} not found in any active server.`);
        }

        const conn = clients.get(targetServerId);
        if (!conn) throw new Error("Server disconnected");

        const result = await conn.client.callTool({
            name: realToolName,
            arguments: request.params.arguments,
        });

        return result;
    });

    // List Resources - Similar logic
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        const allResources: any[] = [];
        for (const [, conn] of clients.entries()) {
            try {
                const res = await conn.client.listResources();
                allResources.push(...res.resources);
                // Note: Resources use URIs. We don't need to prefix them, 
                // but we might need to route readResource requests based on URI patterns.
            } catch (e) { }
        }
        return { resources: allResources };
    });

    // Read Resource
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        // Try to read from all servers? Or find one that supports the scheme?
        // Inefficient to ask all.
        // Better: client should support listResourceTemplates and we match?
        // Fallback: Try all.

        for (const [, conn] of clients.entries()) {
            try {
                const result = await conn.client.readResource({ uri: request.params.uri });
                return result; // Return first success
            } catch (e) {
                // Continue
            }
        }
        throw new Error("Resource not found");
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[Relay] Gateway running on stdio");
}

main().catch(console.error);
