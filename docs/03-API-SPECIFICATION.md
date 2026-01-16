# MCP Toolkit - API Specification Document

> **Complete specification of all Tauri commands (backend APIs) and data types**

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Data Types (TypeScript & Rust)](#2-data-types)
3. [Server Management API](#3-server-management-api)
4. [Client Configuration API](#4-client-configuration-api)
5. [Credential Management API](#5-credential-management-api)
6. [MCP Process Management API](#6-mcp-process-management-api)
7. [Marketplace API](#7-marketplace-api)
8. [Settings API](#8-settings-api)
9. [Analytics API](#9-analytics-api)
10. [Events (Real-time Updates)](#10-events)
11. [Error Handling](#11-error-handling)

---

## 1. API Overview

### How Tauri APIs Work (Quick Reminder)

In Tauri, "APIs" are called **Commands**. They're like Django views or REST endpoints, but:
- Called via `invoke()` instead of `fetch()`
- No HTTP overhead (direct IPC)
- Automatically serialize/deserialize JSON

```typescript
// Frontend: Call a command
import { invoke } from '@tauri-apps/api/core';

const servers = await invoke<Server[]>('get_servers');
const newServer = await invoke<Server>('create_server', { 
  name: 'GitHub', 
  command: 'npx -y @modelcontextprotocol/server-github' 
});
```

```rust
// Backend: Define a command
#[tauri::command]
async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    // Implementation
}
```

### API Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| `get_*` | `get_servers` | Retrieve data |
| `create_*` | `create_server` | Create new item |
| `update_*` | `update_server` | Modify existing |
| `delete_*` | `delete_server` | Remove item |
| `toggle_*` | `toggle_server` | Switch boolean state |
| `export_*` | `export_config` | Generate output |
| `import_*` | `import_config` | Load external data |
| `start_*` | `start_server_process` | Begin process |
| `stop_*` | `stop_server_process` | End process |

---

## 2. Data Types

### Core Types (TypeScript)

```typescript
// src/types/server.ts

/**
 * MCP Server - A tool server that provides capabilities to AI clients
 */
export interface Server {
  id: string;                        // UUID
  name: string;                      // Display name (e.g., "GitHub")
  description?: string;              // Human-readable description
  command: string;                   // Command to run (e.g., "npx")
  args: string[];                    // Command arguments
  env: Record<string, string>;       // Environment variables (non-sensitive)
  envCredentials: string[];          // Credential IDs to inject as env vars
  enabled: boolean;                  // Whether server is enabled globally
  category: ServerCategory;          // Grouping category
  source: ServerSource;              // Where server came from
  marketplaceId?: string;            // If from marketplace, reference ID
  iconUrl?: string;                  // Server icon URL
  documentationUrl?: string;         // Link to docs
  createdAt: string;                 // ISO 8601 timestamp
  updatedAt: string;                 // ISO 8601 timestamp
}

export type ServerCategory = 
  | 'filesystem'     // File system access
  | 'database'       // Database connections
  | 'api'            // External API integrations
  | 'productivity'   // Notes, calendar, etc.
  | 'development'    // Git, CI/CD, etc.
  | 'search'         // Web search, knowledge bases
  | 'communication'  // Slack, email, etc.
  | 'other';

export type ServerSource = 
  | 'local'          // Manually added by user
  | 'marketplace'    // Installed from marketplace
  | 'imported';      // Imported from config file

/**
 * MCP Tool - A capability exposed by a server
 */
export interface ServerTool {
  id: string;
  serverId: string;
  name: string;                      // Tool name (e.g., "read_file")
  description?: string;              // What the tool does
  inputSchema?: object;              // JSON Schema for tool input
}

/**
 * Input types for creating/updating servers
 */
export interface CreateServerInput {
  name: string;
  description?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  envCredentials?: string[];
  category?: ServerCategory;
}

export interface UpdateServerInput {
  id: string;
  name?: string;
  description?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  envCredentials?: string[];
  enabled?: boolean;
  category?: ServerCategory;
}
```

```typescript
// src/types/client.ts

/**
 * AI Client - An application that uses MCP servers (Claude, Cursor, etc.)
 */
export interface Client {
  id: string;
  name: ClientName;
  displayName: string;               // "Claude Desktop"
  configPath: string | null;         // Path to config file
  detected: boolean;                 // Whether client is installed
  supportsFormat: ConfigFormat;      // Config file format
  lastSynced: string | null;         // When config was last exported
}

export type ClientName = 
  | 'claude_desktop'
  | 'cursor'
  | 'vscode_continue'
  | 'vscode_copilot'
  | 'windsurf';

export type ConfigFormat = 'json' | 'jsonc' | 'yaml';

/**
 * Server-Client relationship
 */
export interface ServerClientConfig {
  serverId: string;
  clientId: string;
  enabled: boolean;                  // Enabled for this specific client
}
```

```typescript
// src/types/credential.ts

/**
 * Credential - Reference to a secret stored in OS keychain
 * NEVER contains the actual secret value
 */
export interface Credential {
  id: string;
  name: string;                      // User-friendly name
  keyName: string;                   // OS keychain key name
  envVarName: string;                // Environment variable to inject
  serverId?: string;                 // Associated server (optional)
  createdAt: string;
}

export interface CreateCredentialInput {
  name: string;
  envVarName: string;
  value: string;                     // The secret (only used to store, never returned)
  serverId?: string;
}
```

```typescript
// src/types/marketplace.ts

/**
 * Marketplace Server - A server available for installation
 */
export interface MarketplaceServer {
  id: string;
  name: string;
  description: string;
  author: string;
  command: string;
  args: string[];
  requiredEnvVars: string[];         // Environment variables needed
  category: ServerCategory;
  iconUrl?: string;
  documentationUrl?: string;
  repositoryUrl?: string;
  npmPackage?: string;               // NPM package name
  stars: number;                     // GitHub stars or popularity metric
  downloads: number;                 // Install count
  verified: boolean;                 // Verified by us
  lastUpdated: string;
}
```

```typescript
// src/types/stats.ts

/**
 * Usage statistics for context monitoring
 */
export interface UsageStats {
  serverId: string;
  serverName: string;
  toolName?: string;
  tokensUsed: number;
  timestamp: string;
}

export interface ServerUsageSummary {
  serverId: string;
  serverName: string;
  totalTokens: number;
  toolBreakdown: ToolUsage[];
  period: 'day' | 'week' | 'month';
}

export interface ToolUsage {
  toolName: string;
  tokensUsed: number;
  callCount: number;
}
```

### Core Types (Rust)

```rust
// src-tauri/src/models/server.rs

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: String,              // JSON array stored as string
    pub env: String,               // JSON object stored as string
    pub env_credentials: String,   // JSON array of credential IDs
    pub enabled: bool,
    pub category: String,
    pub source: String,
    pub marketplace_id: Option<String>,
    pub icon_url: Option<String>,
    pub documentation_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateServerInput {
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<std::collections::HashMap<String, String>>,
    pub env_credentials: Option<Vec<String>>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServerInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub command: Option<String>,
    pub args: Option<Vec<String>>,
    pub env: Option<std::collections::HashMap<String, String>>,
    pub env_credentials: Option<Vec<String>>,
    pub enabled: Option<bool>,
    pub category: Option<String>,
}
```

---

## 3. Server Management API

### `get_servers` - List All Servers

Retrieves all configured MCP servers.

**Frontend Usage:**
```typescript
const servers = await invoke<Server[]>('get_servers');
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    let db = state.db.lock().await;
    
    sqlx::query_as::<_, Server>("SELECT * FROM servers ORDER BY name")
        .fetch_all(&*db)
        .await
        .map_err(|e| e.to_string())
}
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "GitHub",
    "description": "Access GitHub repositories",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {},
    "envCredentials": ["github-token"],
    "enabled": true,
    "category": "development",
    "source": "marketplace",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### `get_server` - Get Single Server

Retrieves a single server by ID.

**Frontend Usage:**
```typescript
const server = await invoke<Server>('get_server', { id: 'uuid-here' });
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn get_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
}
```

---

### `create_server` - Create New Server

Creates a new MCP server configuration.

**Frontend Usage:**
```typescript
const server = await invoke<Server>('create_server', {
  input: {
    name: 'File System',
    description: 'Access local files',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/me/projects'],
    category: 'filesystem'
  }
});
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    input: CreateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    let server = Server {
        id: id.clone(),
        name: input.name,
        description: input.description,
        command: input.command,
        args: serde_json::to_string(&input.args.unwrap_or_default())
            .map_err(|e| e.to_string())?,
        env: serde_json::to_string(&input.env.unwrap_or_default())
            .map_err(|e| e.to_string())?,
        env_credentials: serde_json::to_string(&input.env_credentials.unwrap_or_default())
            .map_err(|e| e.to_string())?,
        enabled: false,
        category: input.category.unwrap_or_else(|| "other".to_string()),
        source: "local".to_string(),
        marketplace_id: None,
        icon_url: None,
        documentation_url: None,
        created_at: now.clone(),
        updated_at: now,
    };
    
    sqlx::query(
        "INSERT INTO servers (id, name, description, command, args, env, env_credentials, 
         enabled, category, source, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&server.id)
    .bind(&server.name)
    .bind(&server.description)
    .bind(&server.command)
    .bind(&server.args)
    .bind(&server.env)
    .bind(&server.env_credentials)
    .bind(&server.enabled)
    .bind(&server.category)
    .bind(&server.source)
    .bind(&server.created_at)
    .bind(&server.updated_at)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(server)
}
```

---

### `update_server` - Update Existing Server

Updates an existing server configuration.

**Frontend Usage:**
```typescript
const server = await invoke<Server>('update_server', {
  input: {
    id: 'uuid-here',
    name: 'Updated Name',
    enabled: true
  }
});
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn update_server(
    state: State<'_, AppState>,
    input: UpdateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    // Fetch existing server
    let mut server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&input.id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    // Apply updates
    if let Some(name) = input.name {
        server.name = name;
    }
    if let Some(description) = input.description {
        server.description = Some(description);
    }
    if let Some(command) = input.command {
        server.command = command;
    }
    if let Some(args) = input.args {
        server.args = serde_json::to_string(&args).map_err(|e| e.to_string())?;
    }
    if let Some(env) = input.env {
        server.env = serde_json::to_string(&env).map_err(|e| e.to_string())?;
    }
    if let Some(enabled) = input.enabled {
        server.enabled = enabled;
    }
    if let Some(category) = input.category {
        server.category = category;
    }
    
    server.updated_at = chrono::Utc::now().to_rfc3339();
    
    // Save updates
    sqlx::query(
        "UPDATE servers SET name = ?, description = ?, command = ?, args = ?, 
         env = ?, enabled = ?, category = ?, updated_at = ? WHERE id = ?"
    )
    .bind(&server.name)
    .bind(&server.description)
    .bind(&server.command)
    .bind(&server.args)
    .bind(&server.env)
    .bind(&server.enabled)
    .bind(&server.category)
    .bind(&server.updated_at)
    .bind(&server.id)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(server)
}
```

---

### `delete_server` - Delete Server

Deletes a server configuration.

**Frontend Usage:**
```typescript
await invoke('delete_server', { id: 'uuid-here' });
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn delete_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let db = state.db.lock().await;
    
    // First stop the server if running
    let mcp = state.mcp_manager.lock().await;
    if mcp.is_running(&id).await {
        mcp.stop_server(&id).await?;
    }
    
    sqlx::query("DELETE FROM servers WHERE id = ?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

---

### `toggle_server` - Enable/Disable Server

Toggles a server's enabled state.

**Frontend Usage:**
```typescript
const server = await invoke<Server>('toggle_server', { id: 'uuid-here' });
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn toggle_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    // Get current state
    let mut server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    // Toggle
    server.enabled = !server.enabled;
    server.updated_at = chrono::Utc::now().to_rfc3339();
    
    // Save
    sqlx::query("UPDATE servers SET enabled = ?, updated_at = ? WHERE id = ?")
        .bind(&server.enabled)
        .bind(&server.updated_at)
        .bind(&server.id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(server)
}
```

---

### `duplicate_server` - Clone Server Configuration

Creates a copy of an existing server.

**Frontend Usage:**
```typescript
const newServer = await invoke<Server>('duplicate_server', { id: 'uuid-here' });
```

---

## 4. Client Configuration API

### `get_clients` - List All Clients

Retrieves all known AI clients (Claude Desktop, Cursor, etc.)

**Frontend Usage:**
```typescript
const clients = await invoke<Client[]>('get_clients');
```

**Response:**
```json
[
  {
    "id": "claude_desktop",
    "name": "claude_desktop",
    "displayName": "Claude Desktop",
    "configPath": "/Users/me/.config/claude/claude_desktop_config.json",
    "detected": true,
    "supportsFormat": "json",
    "lastSynced": "2024-01-15T10:30:00Z"
  },
  {
    "id": "cursor",
    "name": "cursor",
    "displayName": "Cursor",
    "configPath": "/Users/me/.cursor/mcp.json",
    "detected": true,
    "supportsFormat": "json",
    "lastSynced": null
  }
]
```

---

### `detect_clients` - Auto-Detect Installed Clients

Scans the system for installed AI clients.

**Frontend Usage:**
```typescript
const clients = await invoke<Client[]>('detect_clients');
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn detect_clients(state: State<'_, AppState>) -> Result<Vec<Client>, String> {
    let mut clients = Vec::new();
    
    // Claude Desktop
    let claude_path = get_claude_config_path()?;
    clients.push(Client {
        id: "claude_desktop".to_string(),
        name: "claude_desktop".to_string(),
        display_name: "Claude Desktop".to_string(),
        config_path: claude_path.clone(),
        detected: claude_path.map(|p| std::path::Path::new(&p).exists()).unwrap_or(false),
        supports_format: "json".to_string(),
        last_synced: None,
    });
    
    // Cursor
    let cursor_path = get_cursor_config_path()?;
    clients.push(Client {
        id: "cursor".to_string(),
        name: "cursor".to_string(),
        display_name: "Cursor".to_string(),
        config_path: cursor_path.clone(),
        detected: cursor_path.map(|p| std::path::Path::new(&p).exists()).unwrap_or(false),
        supports_format: "json".to_string(),
        last_synced: None,
    });
    
    // VS Code Continue
    // ... similar pattern
    
    Ok(clients)
}

fn get_claude_config_path() -> Result<Option<String>, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    
    #[cfg(target_os = "macos")]
    let path = home.join("Library/Application Support/Claude/claude_desktop_config.json");
    
    #[cfg(target_os = "windows")]
    let path = home.join("AppData/Roaming/Claude/claude_desktop_config.json");
    
    #[cfg(target_os = "linux")]
    let path = home.join(".config/claude/claude_desktop_config.json");
    
    Ok(Some(path.to_string_lossy().to_string()))
}
```

---

### `export_config` - Export to Client

Exports enabled servers to a specific client's config file.

**Frontend Usage:**
```typescript
await invoke('export_config', { clientId: 'claude_desktop' });
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn export_config(
    state: State<'_, AppState>,
    client_id: String,
) -> Result<(), String> {
    let db = state.db.lock().await;
    
    // Get client
    let client = get_client(&client_id)?;
    
    // Get enabled servers for this client
    let servers = sqlx::query_as::<_, Server>(
        "SELECT s.* FROM servers s 
         JOIN server_clients sc ON s.id = sc.server_id 
         WHERE sc.client_id = ? AND sc.enabled = true"
    )
    .bind(&client_id)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;
    
    // Build config
    let config = build_client_config(&client, &servers)?;
    
    // Write to file
    let config_path = client.config_path.ok_or("Client config path not found")?;
    std::fs::write(&config_path, config)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    
    Ok(())
}

fn build_client_config(client: &Client, servers: &[Server]) -> Result<String, String> {
    match client.name.as_str() {
        "claude_desktop" => build_claude_config(servers),
        "cursor" => build_cursor_config(servers),
        _ => Err("Unknown client".to_string())
    }
}

fn build_claude_config(servers: &[Server]) -> Result<String, String> {
    let mut mcp_servers = serde_json::Map::new();
    
    for server in servers {
        let args: Vec<String> = serde_json::from_str(&server.args)
            .map_err(|e| e.to_string())?;
        let env: std::collections::HashMap<String, String> = serde_json::from_str(&server.env)
            .map_err(|e| e.to_string())?;
        
        let server_config = serde_json::json!({
            "command": server.command,
            "args": args,
            "env": env
        });
        
        mcp_servers.insert(server.name.clone(), server_config);
    }
    
    let config = serde_json::json!({
        "mcpServers": mcp_servers
    });
    
    serde_json::to_string_pretty(&config)
        .map_err(|e| e.to_string())
}
```

---

### `export_all_configs` - Export to All Clients

Exports to all detected clients at once.

**Frontend Usage:**
```typescript
const results = await invoke<ExportResult[]>('export_all_configs');
```

---

### `get_server_client_configs` - Get Server-Client Mappings

Gets which servers are enabled for which clients.

**Frontend Usage:**
```typescript
const configs = await invoke<ServerClientConfig[]>('get_server_client_configs', { 
  serverId: 'uuid-here' 
});
```

---

### `update_server_client_config` - Toggle Server for Client

Enable/disable a server for a specific client.

**Frontend Usage:**
```typescript
await invoke('update_server_client_config', {
  serverId: 'uuid-here',
  clientId: 'claude_desktop',
  enabled: true
});
```

---

## 5. Credential Management API

### `get_credentials` - List All Credentials

Retrieves all stored credentials (NOT the actual values).

**Frontend Usage:**
```typescript
const credentials = await invoke<Credential[]>('get_credentials');
```

**Response:**
```json
[
  {
    "id": "cred-uuid",
    "name": "GitHub Token",
    "keyName": "mcp-toolkit-github-token",
    "envVarName": "GITHUB_TOKEN",
    "serverId": "server-uuid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### `create_credential` - Store New Credential

Stores a credential in the OS keychain.

**Frontend Usage:**
```typescript
const credential = await invoke<Credential>('create_credential', {
  input: {
    name: 'GitHub Token',
    envVarName: 'GITHUB_TOKEN',
    value: 'ghp_xxxxxxxxxxxx', // This is stored in keychain, never returned
    serverId: 'server-uuid'
  }
});
```

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn create_credential(
    state: State<'_, AppState>,
    input: CreateCredentialInput,
) -> Result<Credential, String> {
    let db = state.db.lock().await;
    let keychain = state.keychain.lock().await;
    
    let id = uuid::Uuid::new_v4().to_string();
    let key_name = format!("mcp-toolkit-{}", id);
    
    // Store in OS keychain
    keychain.store(&key_name, &input.value)?;
    
    let credential = Credential {
        id: id.clone(),
        name: input.name,
        key_name: key_name.clone(),
        env_var_name: input.env_var_name,
        server_id: input.server_id,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    // Store reference in database (NOT the value)
    sqlx::query(
        "INSERT INTO credentials (id, name, key_name, env_var_name, server_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&credential.id)
    .bind(&credential.name)
    .bind(&credential.key_name)
    .bind(&credential.env_var_name)
    .bind(&credential.server_id)
    .bind(&credential.created_at)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(credential)
}
```

---

### `update_credential` - Update Credential Value

Updates an existing credential's value.

**Frontend Usage:**
```typescript
await invoke('update_credential', {
  id: 'cred-uuid',
  value: 'new-secret-value'
});
```

---

### `delete_credential` - Delete Credential

Removes a credential from the database and keychain.

**Frontend Usage:**
```typescript
await invoke('delete_credential', { id: 'cred-uuid' });
```

---

### `verify_credential` - Check if Credential Exists

Verifies a credential is accessible in the keychain.

**Frontend Usage:**
```typescript
const isValid = await invoke<boolean>('verify_credential', { id: 'cred-uuid' });
```

---

## 6. MCP Process Management API

### `start_server_process` - Start MCP Server

Starts an MCP server process and discovers its tools.

**Frontend Usage:**
```typescript
const tools = await invoke<ServerTool[]>('start_server_process', { 
  serverId: 'uuid-here' 
});
```

**Response:**
```json
[
  {
    "id": "tool-uuid",
    "serverId": "server-uuid",
    "name": "read_file",
    "description": "Read contents of a file",
    "inputSchema": {
      "type": "object",
      "properties": {
        "path": { "type": "string", "description": "File path to read" }
      },
      "required": ["path"]
    }
  }
]
```

---

### `stop_server_process` - Stop MCP Server

Stops a running MCP server process.

**Frontend Usage:**
```typescript
await invoke('stop_server_process', { serverId: 'uuid-here' });
```

---

### `get_server_status` - Get Process Status

Gets the current status of a server process.

**Frontend Usage:**
```typescript
const status = await invoke<ServerStatus>('get_server_status', { 
  serverId: 'uuid-here' 
});
```

**Response:**
```json
{
  "serverId": "server-uuid",
  "running": true,
  "pid": 12345,
  "uptime": 3600,
  "toolCount": 5,
  "lastError": null
}
```

---

### `get_all_server_statuses` - Get All Process Statuses

Gets status of all server processes.

**Frontend Usage:**
```typescript
const statuses = await invoke<ServerStatus[]>('get_all_server_statuses');
```

---

### `restart_server_process` - Restart Server

Stops and starts a server process.

**Frontend Usage:**
```typescript
await invoke('restart_server_process', { serverId: 'uuid-here' });
```

---

### `get_server_logs` - Get Server Logs

Retrieves recent logs from a server process.

**Frontend Usage:**
```typescript
const logs = await invoke<LogEntry[]>('get_server_logs', { 
  serverId: 'uuid-here',
  limit: 100
});
```

**Response:**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "info",
    "message": "Server initialized successfully",
    "serverId": "server-uuid"
  },
  {
    "timestamp": "2024-01-15T10:30:01Z",
    "level": "error",
    "message": "Failed to connect to API",
    "serverId": "server-uuid"
  }
]
```

---

## 7. Marketplace API

### `get_marketplace_servers` - List Available Servers

Retrieves servers available in the marketplace.

**Frontend Usage:**
```typescript
const servers = await invoke<MarketplaceServer[]>('get_marketplace_servers', {
  category: 'development',
  search: 'github',
  page: 1,
  limit: 20
});
```

**Note:** For MVP, this can be a static JSON file bundled with the app. Later, it can fetch from a remote API.

---

### `install_marketplace_server` - Install from Marketplace

Installs a server from the marketplace.

**Frontend Usage:**
```typescript
const server = await invoke<Server>('install_marketplace_server', {
  marketplaceId: 'github-official'
});
```

---

### `check_server_updates` - Check for Server Updates

Checks if installed marketplace servers have updates.

**Frontend Usage:**
```typescript
const updates = await invoke<ServerUpdate[]>('check_server_updates');
```

---

## 8. Settings API

### `get_settings` - Get All Settings

Retrieves all application settings.

**Frontend Usage:**
```typescript
const settings = await invoke<AppSettings>('get_settings');
```

**Response:**
```json
{
  "theme": "system",
  "autoStartServers": false,
  "autoExportOnChange": true,
  "defaultClient": "claude_desktop",
  "showTokenUsage": true,
  "contextWarningThreshold": 50000,
  "checkUpdatesAutomatically": true
}
```

---

### `update_settings` - Update Settings

Updates application settings.

**Frontend Usage:**
```typescript
await invoke('update_settings', {
  settings: {
    theme: 'dark',
    autoExportOnChange: false
  }
});
```

---

### `get_setting` - Get Single Setting

Gets a single setting value.

**Frontend Usage:**
```typescript
const theme = await invoke<string>('get_setting', { key: 'theme' });
```

---

### `reset_settings` - Reset to Defaults

Resets all settings to defaults.

**Frontend Usage:**
```typescript
await invoke('reset_settings');
```

---

## 9. Analytics API

### `get_usage_stats` - Get Usage Statistics

Retrieves context usage statistics.

**Frontend Usage:**
```typescript
const stats = await invoke<UsageStats[]>('get_usage_stats', {
  serverId: 'uuid-here', // optional
  period: 'week'
});
```

---

### `get_usage_summary` - Get Usage Summary

Gets aggregated usage summary.

**Frontend Usage:**
```typescript
const summary = await invoke<ServerUsageSummary[]>('get_usage_summary', {
  period: 'week'
});
```

---

### `record_usage` - Record Token Usage

Records token usage for a server (called internally).

**Backend Implementation:**
```rust
#[tauri::command]
pub async fn record_usage(
    state: State<'_, AppState>,
    server_id: String,
    tool_name: Option<String>,
    tokens_used: i64,
) -> Result<(), String> {
    let db = state.db.lock().await;
    
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        "INSERT INTO usage_stats (id, server_id, tool_name, tokens_used, timestamp)
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&server_id)
    .bind(&tool_name)
    .bind(&tokens_used)
    .bind(&now)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

---

## 10. Events

Tauri events allow real-time updates from backend to frontend.

### Event Types

```typescript
// src/types/events.ts

export type TauriEvent = 
  | ServerStatusEvent
  | ServerLogEvent
  | ConfigExportedEvent
  | ErrorEvent;

export interface ServerStatusEvent {
  type: 'server_status_changed';
  payload: {
    serverId: string;
    status: 'starting' | 'running' | 'stopped' | 'error';
    error?: string;
  };
}

export interface ServerLogEvent {
  type: 'server_log';
  payload: {
    serverId: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
  };
}

export interface ConfigExportedEvent {
  type: 'config_exported';
  payload: {
    clientId: string;
    success: boolean;
    error?: string;
  };
}

export interface ErrorEvent {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Listening to Events (Frontend)

```typescript
import { listen } from '@tauri-apps/api/event';

// Listen for server status changes
const unlisten = await listen<ServerStatusEvent['payload']>('server_status_changed', (event) => {
  console.log('Server status:', event.payload);
});

// Clean up when component unmounts
unlisten();
```

### Emitting Events (Backend)

```rust
use tauri::Emitter;

// Inside a command or service
app_handle.emit("server_status_changed", ServerStatusPayload {
    server_id: "uuid".to_string(),
    status: "running".to_string(),
    error: None,
}).map_err(|e| e.to_string())?;
```

---

## 11. Error Handling

### Error Types

```typescript
// src/types/error.ts

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
}

export type ErrorCode =
  | 'SERVER_NOT_FOUND'
  | 'SERVER_ALREADY_RUNNING'
  | 'SERVER_START_FAILED'
  | 'CONFIG_WRITE_FAILED'
  | 'CREDENTIAL_NOT_FOUND'
  | 'CREDENTIAL_STORE_FAILED'
  | 'CLIENT_NOT_DETECTED'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';
```

### Error Handling Pattern (Frontend)

```typescript
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/toast';

async function safeInvoke<T>(
  command: string, 
  args?: Record<string, any>
): Promise<T | null> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    const message = typeof error === 'string' ? error : 'An error occurred';
    toast.error(message);
    console.error(`Command ${command} failed:`, error);
    return null;
  }
}

// Usage
const servers = await safeInvoke<Server[]>('get_servers');
```

### Error Handling Pattern (Backend)

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Server not found: {0}")]
    ServerNotFound(String),
    
    #[error("Server already running: {0}")]
    ServerAlreadyRunning(String),
    
    #[error("Failed to start server: {0}")]
    ServerStartFailed(String),
    
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    
    #[error("Keychain error: {0}")]
    KeychainError(String),
}

// In commands, convert to String for Tauri
#[tauri::command]
pub async fn get_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<Server, String> {
    // ... implementation
    // Errors are automatically converted to strings
}
```

---

## API Summary Table

| Category | Command | Description | MVP |
|----------|---------|-------------|-----|
| **Servers** | `get_servers` | List all servers | ✅ |
| | `get_server` | Get single server | ✅ |
| | `create_server` | Create server | ✅ |
| | `update_server` | Update server | ✅ |
| | `delete_server` | Delete server | ✅ |
| | `toggle_server` | Toggle enabled | ✅ |
| | `duplicate_server` | Clone server | v1.0 |
| **Clients** | `get_clients` | List clients | ✅ |
| | `detect_clients` | Auto-detect | ✅ |
| | `export_config` | Export to client | ✅ |
| | `export_all_configs` | Export to all | ✅ |
| **Credentials** | `get_credentials` | List credentials | v1.0 |
| | `create_credential` | Store credential | v1.0 |
| | `update_credential` | Update credential | v1.0 |
| | `delete_credential` | Delete credential | v1.0 |
| **Processes** | `start_server_process` | Start server | v1.0 |
| | `stop_server_process` | Stop server | v1.0 |
| | `get_server_status` | Get status | ✅ |
| | `get_server_logs` | Get logs | v1.0 |
| **Marketplace** | `get_marketplace_servers` | Browse servers | v1.0 |
| | `install_marketplace_server` | Install server | v1.0 |
| **Settings** | `get_settings` | Get settings | ✅ |
| | `update_settings` | Update settings | ✅ |
| **Analytics** | `get_usage_stats` | Usage stats | v1.0 |
| | `get_usage_summary` | Usage summary | v1.0 |

---

*Next: Read `04-IMPLEMENTATION-ROADMAP.md` for the build order and timeline*
