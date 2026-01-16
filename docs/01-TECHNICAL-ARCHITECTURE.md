# MCP Toolkit - Technical Architecture Document

> **For developers familiar with Django/React but new to Tauri/Rust**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack Overview](#2-technology-stack-overview)
3. [Understanding Tauri (The "Django" of Desktop Apps)](#3-understanding-tauri)
4. [Frontend Architecture (React - You Know This!)](#4-frontend-architecture)
5. [Backend Architecture (Rust - The New Part)](#5-backend-architecture)
6. [Data Layer](#6-data-layer)
7. [MCP Protocol Integration](#7-mcp-protocol-integration)
8. [Security Architecture](#8-security-architecture)
9. [Performance Considerations](#9-performance-considerations)
10. [Deployment & Distribution](#10-deployment--distribution)

---

## 1. Executive Summary

### What We're Building

A desktop application that helps developers manage MCP (Model Context Protocol) servers. Think of it as "Docker Desktop but for MCP servers" - a GUI that makes it easy to:

- Install and configure MCP servers (like npm packages for AI tools)
- Toggle servers on/off for different AI clients (Claude, Cursor, VS Code)
- Monitor which servers are eating up your context window
- Securely store API keys and credentials

### Why These Technologies?

| Technology | Why We're Using It | Django/React Equivalent |
|------------|-------------------|------------------------|
| **Tauri 2.0** | Lightweight desktop framework (2-10MB vs Electron's 150MB) | Like Django - it's the "backend framework" for desktop |
| **React 19** | You already know it! | Same React you know |
| **Rust** | Tauri's backend language (fast, safe, required) | Like Python in Django - the server-side language |
| **SQLite** | Local database, no server needed | Like SQLite in Django, but local-only |
| **TypeScript** | Type safety for frontend | Same as always |

---

## 2. Technology Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP TOOLKIT                               │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (What users see - runs in WebView)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React 19 + TypeScript                                   │   │
│  │  ├── Vite (build tool, like webpack but faster)         │   │
│  │  ├── Zustand (state management, simpler than Redux)     │   │
│  │  ├── TanStack Query (data fetching, like SWR)           │   │
│  │  ├── shadcn/ui (UI components, like MUI but lighter)    │   │
│  │  └── Tailwind CSS (styling)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ IPC (Inter-Process Communication) │
│                              │ Like API calls, but instant       │
│                              ▼                                   │
│  BACKEND (Rust - runs natively on the computer)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tauri 2.0 Core                                          │   │
│  │  ├── Commands (like Django views/API endpoints)         │   │
│  │  ├── Events (like WebSockets, for real-time updates)    │   │
│  │  ├── State (like Django's request.session)              │   │
│  │  └── Plugins                                            │   │
│  │      ├── tauri-plugin-sql (SQLite database)             │   │
│  │      ├── tauri-plugin-shell (run terminal commands)     │   │
│  │      ├── tauri-plugin-fs (file system access)           │   │
│  │      ├── tauri-plugin-store (key-value storage)         │   │
│  │      └── tauri-plugin-os (system info)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  SYSTEM LAYER (What we interact with)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ├── MCP Servers (spawned as child processes)           │   │
│  │  ├── Config Files (~/.claude/config.json, etc.)         │   │
│  │  ├── OS Keychain (secure credential storage)            │   │
│  │  └── File System (logs, exports)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Understanding Tauri

### What is Tauri? (Django Analogy)

Think of Tauri like Django for desktop apps:

| Django Concept | Tauri Equivalent | What It Does |
|----------------|------------------|--------------|
| `views.py` | `src-tauri/src/commands.rs` | Functions that handle requests |
| `urls.py` | `#[tauri::command]` decorator | Routes requests to functions |
| `settings.py` | `tauri.conf.json` | App configuration |
| `models.py` | Rust structs + SQLite | Data structures |
| `manage.py runserver` | `cargo tauri dev` | Run development server |
| `python manage.py build` | `cargo tauri build` | Build for production |
| Django REST Framework | Tauri IPC | API for frontend-backend communication |
| `request.POST` | Command parameters | Data from frontend |
| `JsonResponse` | Return value | Data to frontend |

### How Tauri Works

```
┌──────────────────┐         ┌──────────────────┐
│    FRONTEND      │   IPC   │     BACKEND      │
│    (React)       │◄───────►│     (Rust)       │
│                  │         │                  │
│  - UI rendering  │         │  - File system   │
│  - User input    │         │  - Database      │
│  - State display │         │  - Processes     │
│                  │         │  - Security      │
└──────────────────┘         └──────────────────┘
        │                            │
        │      WebView (Browser)     │
        │      ◄─────────────────    │
        │      Like Chrome, but      │
        │      embedded in app       │
        │                            │
```

**Key Insight**: Your React code runs in a "WebView" (like a mini browser). The Rust code runs natively. They talk via "IPC" (Inter-Process Communication) - basically instant API calls.

### Tauri vs Electron (Why We Chose Tauri)

| Aspect | Electron | Tauri | Why It Matters |
|--------|----------|-------|----------------|
| Bundle Size | 150-200 MB | 2-10 MB | Users download faster |
| Memory Usage | 200-300 MB | 30-50 MB | Doesn't slow down computer |
| Backend Language | JavaScript (Node) | Rust | More secure, faster |
| Security | You handle it | Secure by default | Less work for us |
| Learning Curve | Easier (all JS) | Harder (need some Rust) | We'll mostly write React |

---

## 4. Frontend Architecture

### This Is React - You Know This!

The frontend is 100% React. The only difference from web development:

1. **No browser APIs** like `window.location` or `localStorage` (use Tauri plugins instead)
2. **Call Rust functions** instead of `fetch()` for backend operations
3. **Desktop-specific features** like system tray, native menus

### Project Structure

```
src/
├── main.tsx                 # Entry point (like index.js)
├── App.tsx                  # Root component
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainContent.tsx
│   └── features/            # Feature-specific components
│       ├── servers/
│       │   ├── ServerList.tsx
│       │   ├── ServerCard.tsx
│       │   ├── ServerConfigForm.tsx
│       │   └── ServerStatusBadge.tsx
│       ├── marketplace/
│       │   ├── MarketplaceGrid.tsx
│       │   └── ServerDetailModal.tsx
│       └── settings/
│           ├── SettingsPage.tsx
│           └── CredentialManager.tsx
├── hooks/                   # Custom React hooks
│   ├── useServers.ts        # Server CRUD operations
│   ├── useTauriCommand.ts   # Generic Tauri command wrapper
│   └── useToast.ts          # Notifications
├── stores/                  # Zustand state stores
│   ├── serverStore.ts       # Server state
│   ├── configStore.ts       # App configuration
│   └── uiStore.ts           # UI state (modals, sidebar)
├── lib/                     # Utilities
│   ├── tauri.ts             # Tauri API wrappers
│   ├── utils.ts             # Helper functions
│   └── constants.ts         # App constants
├── types/                   # TypeScript types
│   ├── server.ts            # Server-related types
│   ├── config.ts            # Config types
│   └── mcp.ts               # MCP protocol types
└── styles/
    └── globals.css          # Global styles + Tailwind
```

### Calling the Backend (Instead of fetch())

In web development, you'd call an API:

```typescript
// WEB: How you'd call an API
const response = await fetch('/api/servers');
const servers = await response.json();
```

In Tauri, you "invoke" a command:

```typescript
// TAURI: How you call the Rust backend
import { invoke } from '@tauri-apps/api/core';

const servers = await invoke('get_servers');
// That's it! No URL, no JSON parsing - Tauri handles it
```

### State Management with Zustand

Zustand is like Redux but simpler. Here's a comparison:

```typescript
// REDUX (complicated)
const serverSlice = createSlice({
  name: 'servers',
  initialState: { servers: [], loading: false },
  reducers: {
    setServers: (state, action) => { state.servers = action.payload },
    setLoading: (state, action) => { state.loading = action.payload },
  }
});
// Plus: store setup, Provider wrapper, useDispatch, useSelector...

// ZUSTAND (simple)
import { create } from 'zustand';

interface ServerStore {
  servers: Server[];
  loading: boolean;
  fetchServers: () => Promise<void>;
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: [],
  loading: false,
  fetchServers: async () => {
    set({ loading: true });
    const servers = await invoke('get_servers');
    set({ servers, loading: false });
  },
}));

// Usage in component:
const { servers, loading, fetchServers } = useServerStore();
```

### UI Components with shadcn/ui

shadcn/ui is NOT a component library you install. It's a collection of components you copy into your project. This means:

- ✅ Full control over the code
- ✅ No version conflicts
- ✅ Customize anything
- ❌ Manual updates (but rarely needed)

```bash
# How to add a component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

This copies the component code into `src/components/ui/`.

---

## 5. Backend Architecture

### Rust Basics for Tauri (Just Enough to Understand)

You don't need to become a Rust expert. Here's the minimum:

#### Variables and Types

```rust
// Rust (like TypeScript but stricter)
let name: String = String::from("hello");  // String type
let count: i32 = 42;                        // Integer (i32 = 32-bit int)
let is_active: bool = true;                 // Boolean
let items: Vec<String> = vec![];            // Array/List (Vec = Vector)

// TypeScript equivalent
// let name: string = "hello";
// let count: number = 42;
// let is_active: boolean = true;
// let items: string[] = [];
```

#### Structs (Like TypeScript Interfaces + Classes)

```rust
// Rust struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub command: String,
    pub enabled: bool,
}

// TypeScript equivalent
// interface Server {
//   id: string;
//   name: string;
//   command: string;
//   enabled: boolean;
// }
```

#### Functions

```rust
// Rust function
fn add_numbers(a: i32, b: i32) -> i32 {
    a + b  // No semicolon = return value (like implicit return)
}

// With explicit return
fn add_numbers(a: i32, b: i32) -> i32 {
    return a + b;
}

// TypeScript equivalent
// function addNumbers(a: number, b: number): number {
//   return a + b;
// }
```

#### Error Handling (Result Type)

```rust
// Rust uses Result instead of try/catch
fn read_file(path: &str) -> Result<String, Error> {
    // If success, return Ok(value)
    // If error, return Err(error)
    let content = std::fs::read_to_string(path)?;  // ? = propagate error
    Ok(content)
}

// TypeScript equivalent (conceptually)
// async function readFile(path: string): Promise<string> {
//   return await fs.readFile(path);  // throws on error
// }
```

### Tauri Commands (Like Django Views)

```rust
// src-tauri/src/commands/servers.rs

use tauri::State;
use crate::state::AppState;
use crate::models::Server;

// This is like a Django view!
// The #[tauri::command] decorator makes it callable from React
#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    // state is like request.session - shared app state
    let db = state.db.lock().await;
    
    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers")
        .fetch_all(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(servers)
}

// Django equivalent:
// @api_view(['GET'])
// def get_servers(request):
//     servers = Server.objects.all()
//     return Response(ServerSerializer(servers, many=True).data)

#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    name: String,
    command: String,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    let server = Server {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        command,
        enabled: false,
    };
    
    sqlx::query("INSERT INTO servers (id, name, command, enabled) VALUES (?, ?, ?, ?)")
        .bind(&server.id)
        .bind(&server.name)
        .bind(&server.command)
        .bind(&server.enabled)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(server)
}
```

### Registering Commands (Like urls.py)

```rust
// src-tauri/src/main.rs

mod commands;
mod models;
mod state;

fn main() {
    tauri::Builder::default()
        // Register all your commands here (like urlpatterns)
        .invoke_handler(tauri::generate_handler![
            commands::servers::get_servers,
            commands::servers::create_server,
            commands::servers::update_server,
            commands::servers::delete_server,
            commands::servers::toggle_server,
            commands::config::export_config,
            commands::config::import_config,
            commands::credentials::store_credential,
            commands::credentials::get_credential,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Backend File Structure

```
src-tauri/
├── Cargo.toml               # Like package.json for Rust
├── tauri.conf.json          # Tauri configuration (like settings.py)
├── src/
│   ├── main.rs              # Entry point (registers commands)
│   ├── lib.rs               # Library exports
│   ├── commands/            # Command handlers (like views/)
│   │   ├── mod.rs           # Module exports
│   │   ├── servers.rs       # Server CRUD commands
│   │   ├── config.rs        # Config import/export
│   │   ├── credentials.rs   # Credential management
│   │   └── mcp.rs           # MCP protocol commands
│   ├── models/              # Data structures (like models.py)
│   │   ├── mod.rs
│   │   ├── server.rs
│   │   └── config.rs
│   ├── state/               # App state management
│   │   ├── mod.rs
│   │   └── app_state.rs
│   ├── services/            # Business logic
│   │   ├── mod.rs
│   │   ├── mcp_manager.rs   # MCP server process management
│   │   ├── config_sync.rs   # Config file synchronization
│   │   └── keychain.rs      # OS keychain integration
│   └── utils/               # Helpers
│       ├── mod.rs
│       └── paths.rs         # Platform-specific paths
├── migrations/              # SQLite migrations
│   └── 001_initial.sql
└── icons/                   # App icons
```

---

## 6. Data Layer

### SQLite Database (Same as Django SQLite)

We use SQLite because:
- No server to install
- Single file database
- Perfect for desktop apps
- You already know it from Django

### Database Schema

```sql
-- migrations/001_initial.sql

-- Servers table (MCP servers we manage)
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    command TEXT NOT NULL,           -- e.g., "npx -y @modelcontextprotocol/server-filesystem"
    args TEXT,                       -- JSON array of arguments
    env TEXT,                        -- JSON object of environment variables
    enabled BOOLEAN DEFAULT FALSE,
    category TEXT,                   -- "filesystem", "database", "api", etc.
    source TEXT,                     -- "local", "marketplace", "custom"
    marketplace_id TEXT,             -- Reference to marketplace if installed from there
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Server tools (tools exposed by each server)
CREATE TABLE IF NOT EXISTS server_tools (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    input_schema TEXT,               -- JSON Schema for tool input
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Client configurations (Claude Desktop, Cursor, VS Code)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,              -- "claude_desktop", "cursor", "vscode"
    display_name TEXT NOT NULL,      -- "Claude Desktop", "Cursor", "VS Code"
    config_path TEXT,                -- Path to config file
    detected BOOLEAN DEFAULT FALSE,  -- Whether we found it installed
    last_synced DATETIME
);

-- Server-Client relationships (which servers are enabled for which clients)
CREATE TABLE IF NOT EXISTS server_clients (
    server_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (server_id, client_id),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Credentials (encrypted references, actual values in OS keychain)
CREATE TABLE IF NOT EXISTS credentials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,              -- User-friendly name
    key_name TEXT NOT NULL UNIQUE,   -- Keychain key name
    server_id TEXT,                  -- Associated server (optional)
    env_var_name TEXT,               -- Environment variable to inject
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL
);

-- Usage stats (context window monitoring)
CREATE TABLE IF NOT EXISTS usage_stats (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL,
    tool_name TEXT,
    tokens_used INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- App settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_servers_enabled ON servers(enabled);
CREATE INDEX IF NOT EXISTS idx_server_tools_server ON server_tools(server_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_server ON usage_stats(server_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_timestamp ON usage_stats(timestamp);
```

### TypeScript Types (Frontend)

```typescript
// src/types/server.ts

export interface Server {
  id: string;
  name: string;
  description?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
  category?: ServerCategory;
  source: 'local' | 'marketplace' | 'custom';
  marketplaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServerCategory = 
  | 'filesystem'
  | 'database' 
  | 'api'
  | 'productivity'
  | 'development'
  | 'other';

export interface ServerTool {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  inputSchema?: object;
}

export interface Client {
  id: string;
  name: 'claude_desktop' | 'cursor' | 'vscode';
  displayName: string;
  configPath?: string;
  detected: boolean;
  lastSynced?: string;
}

export interface Credential {
  id: string;
  name: string;
  keyName: string;
  serverId?: string;
  envVarName?: string;
  createdAt: string;
}

export interface UsageStats {
  id: string;
  serverId: string;
  toolName?: string;
  tokensUsed: number;
  timestamp: string;
}
```

---

## 7. MCP Protocol Integration

### What is MCP? (Quick Refresher)

MCP (Model Context Protocol) is how AI assistants talk to external tools. It's like:
- **REST API** but for AI tools
- **JSON-RPC 2.0** over stdio (standard input/output)

```
┌─────────────┐     JSON-RPC 2.0      ┌─────────────┐
│  AI Client  │◄─────────────────────►│ MCP Server  │
│  (Claude)   │      over stdio       │ (Your tool) │
└─────────────┘                       └─────────────┘
```

### How MCP Servers Run

1. **Client spawns server** as a child process
2. **Communication via stdio** (stdin/stdout, like piping in terminal)
3. **JSON-RPC 2.0 protocol** for messages

Example flow:
```
Client -> Server: {"jsonrpc":"2.0","method":"initialize","params":{...},"id":1}
Server -> Client: {"jsonrpc":"2.0","result":{"capabilities":{...}},"id":1}
Client -> Server: {"jsonrpc":"2.0","method":"tools/list","id":2}
Server -> Client: {"jsonrpc":"2.0","result":{"tools":[...]},"id":2}
```

### Our MCP Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP TOOLKIT                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 MCP Manager Service                   │   │
│  │                                                       │   │
│  │  Responsibilities:                                    │   │
│  │  • Spawn MCP server processes                        │   │
│  │  • Send JSON-RPC messages to discover tools          │   │
│  │  • Monitor process health                            │   │
│  │  • Inject environment variables (credentials)        │   │
│  │  • Capture logs                                      │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│            ┌─────────────┼─────────────┐                    │
│            ▼             ▼             ▼                    │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│     │ Server 1 │  │ Server 2 │  │ Server 3 │              │
│     │ Process  │  │ Process  │  │ Process  │              │
│     │          │  │          │  │          │              │
│     │ Filesys  │  │ Database │  │ GitHub   │              │
│     └──────────┘  └──────────┘  └──────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### MCP Manager Implementation (Rust)

```rust
// src-tauri/src/services/mcp_manager.rs

use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use tokio::sync::Mutex;
use serde_json::{json, Value};

pub struct McpManager {
    processes: Mutex<HashMap<String, McpProcess>>,
}

struct McpProcess {
    child: Child,
    server_id: String,
    tools: Vec<McpTool>,
}

#[derive(Clone, Debug)]
pub struct McpTool {
    pub name: String,
    pub description: Option<String>,
    pub input_schema: Option<Value>,
}

impl McpManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }
    
    /// Start an MCP server and discover its tools
    pub async fn start_server(
        &self,
        server_id: &str,
        command: &str,
        args: &[String],
        env: &HashMap<String, String>,
    ) -> Result<Vec<McpTool>, String> {
        // Build the command
        let mut cmd = Command::new(command);
        cmd.args(args)
           .stdin(Stdio::piped())
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
        
        // Inject environment variables (including credentials)
        for (key, value) in env {
            cmd.env(key, value);
        }
        
        // Spawn the process
        let mut child = cmd.spawn()
            .map_err(|e| format!("Failed to spawn process: {}", e))?;
        
        // Get stdin/stdout handles
        let stdin = child.stdin.take()
            .ok_or("Failed to get stdin")?;
        let stdout = child.stdout.take()
            .ok_or("Failed to get stdout")?;
        
        // Initialize and discover tools
        let tools = self.initialize_and_discover(stdin, stdout).await?;
        
        // Store the process
        let mut processes = self.processes.lock().await;
        processes.insert(server_id.to_string(), McpProcess {
            child,
            server_id: server_id.to_string(),
            tools: tools.clone(),
        });
        
        Ok(tools)
    }
    
    async fn initialize_and_discover(
        &self,
        mut stdin: std::process::ChildStdin,
        stdout: std::process::ChildStdout,
    ) -> Result<Vec<McpTool>, String> {
        let reader = BufReader::new(stdout);
        
        // Send initialize request
        let init_request = json!({
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "mcp-toolkit",
                    "version": "1.0.0"
                }
            },
            "id": 1
        });
        
        writeln!(stdin, "{}", init_request.to_string())
            .map_err(|e| format!("Failed to write: {}", e))?;
        stdin.flush().map_err(|e| format!("Failed to flush: {}", e))?;
        
        // Read initialize response
        // (In production, use async IO and proper message parsing)
        
        // Send tools/list request
        let tools_request = json!({
            "jsonrpc": "2.0",
            "method": "tools/list",
            "id": 2
        });
        
        writeln!(stdin, "{}", tools_request.to_string())
            .map_err(|e| format!("Failed to write: {}", e))?;
        stdin.flush().map_err(|e| format!("Failed to flush: {}", e))?;
        
        // Parse tools from response
        // (Simplified - real implementation needs proper JSON-RPC parsing)
        let tools = vec![]; // Parse from response
        
        Ok(tools)
    }
    
    /// Stop an MCP server
    pub async fn stop_server(&self, server_id: &str) -> Result<(), String> {
        let mut processes = self.processes.lock().await;
        if let Some(mut process) = processes.remove(server_id) {
            process.child.kill()
                .map_err(|e| format!("Failed to kill process: {}", e))?;
        }
        Ok(())
    }
    
    /// Check if a server is running
    pub async fn is_running(&self, server_id: &str) -> bool {
        let processes = self.processes.lock().await;
        processes.contains_key(server_id)
    }
}
```

---

## 8. Security Architecture

### Credential Storage (OS Keychain)

**Never store API keys in plain text!** We use the OS keychain:

| OS | Keychain | 
|----|----------|
| macOS | Keychain Access |
| Windows | Windows Credential Manager |
| Linux | Secret Service (GNOME Keyring) |

```rust
// src-tauri/src/services/keychain.rs

use keyring::Entry;

pub struct KeychainService {
    service_name: String,
}

impl KeychainService {
    pub fn new() -> Self {
        Self {
            service_name: "mcp-toolkit".to_string(),
        }
    }
    
    /// Store a credential in the OS keychain
    pub fn store(&self, key: &str, value: &str) -> Result<(), String> {
        let entry = Entry::new(&self.service_name, key)
            .map_err(|e| format!("Failed to create entry: {}", e))?;
        entry.set_password(value)
            .map_err(|e| format!("Failed to store credential: {}", e))?;
        Ok(())
    }
    
    /// Retrieve a credential from the OS keychain
    pub fn get(&self, key: &str) -> Result<String, String> {
        let entry = Entry::new(&self.service_name, key)
            .map_err(|e| format!("Failed to create entry: {}", e))?;
        entry.get_password()
            .map_err(|e| format!("Failed to get credential: {}", e))
    }
    
    /// Delete a credential from the OS keychain
    pub fn delete(&self, key: &str) -> Result<(), String> {
        let entry = Entry::new(&self.service_name, key)
            .map_err(|e| format!("Failed to create entry: {}", e))?;
        entry.delete_credential()
            .map_err(|e| format!("Failed to delete credential: {}", e))?;
        Ok(())
    }
}
```

### Tauri Security Model

Tauri is "secure by default". You must explicitly enable capabilities:

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for MCP Toolkit",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-spawn",
    "shell:allow-execute",
    "fs:allow-read",
    "fs:allow-write",
    "fs:scope-home",
    "sql:allow-execute",
    "sql:allow-select",
    "store:allow-get",
    "store:allow-set",
    "os:allow-platform"
  ]
}
```

---

## 9. Performance Considerations

### Context Window Optimization

The #1 pain point is context window consumption. Our approach:

```
┌─────────────────────────────────────────────────────────────┐
│              CONTEXT OPTIMIZATION STRATEGY                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LAZY LOADING                                            │
│     Only load server tools when actually needed              │
│     Don't initialize all servers at once                     │
│                                                              │
│  2. SELECTIVE ACTIVATION                                     │
│     Let users enable only relevant servers per task          │
│     "Working on code? Disable filesystem, enable git"        │
│                                                              │
│  3. CONTEXT PROFILES                                         │
│     Pre-configured server sets for common tasks              │
│     "Coding Profile" = git + database + docs                 │
│     "Writing Profile" = web search + notes                   │
│                                                              │
│  4. USAGE MONITORING                                         │
│     Track tokens consumed per server/tool                    │
│     Alert when context usage is high                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Memory Management

```rust
// Spawn processes efficiently, clean up properly

impl McpManager {
    /// Periodically check and clean up zombie processes
    pub async fn cleanup_dead_processes(&self) {
        let mut processes = self.processes.lock().await;
        processes.retain(|_, process| {
            match process.child.try_wait() {
                Ok(Some(_)) => false,  // Process exited, remove it
                Ok(None) => true,      // Still running, keep it
                Err(_) => false,       // Error checking, remove it
            }
        });
    }
}
```

---

## 10. Deployment & Distribution

### Building for Release

```bash
# Development
npm run tauri dev

# Production build
npm run tauri build
```

This produces:

| Platform | Output |
|----------|--------|
| macOS | `.dmg` installer + `.app` bundle |
| Windows | `.msi` installer + `.exe` |
| Linux | `.deb`, `.rpm`, `.AppImage` |

### Auto-Updates

Tauri has built-in auto-update support:

```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.mcp-toolkit.com/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### Code Signing (Required for Distribution)

| Platform | Requirement | Cost |
|----------|-------------|------|
| macOS | Apple Developer Certificate | $99/year |
| Windows | Code Signing Certificate | $200-500/year |
| Linux | None required | Free |

**MVP Approach**: Start with Linux (free), add macOS/Windows after first revenue.

---

## Quick Reference Card

### Commands You'll Use Daily

```bash
# Start development
npm run tauri dev

# Build for production
npm run tauri build

# Add a shadcn component
npx shadcn-ui@latest add [component]

# Run frontend only (for UI work)
npm run dev

# Check Rust code
cd src-tauri && cargo check

# Format Rust code
cd src-tauri && cargo fmt
```

### File to Edit for Common Tasks

| Task | File |
|------|------|
| Add new API endpoint | `src-tauri/src/commands/*.rs` |
| Register endpoint | `src-tauri/src/main.rs` |
| Add UI component | `src/components/**/*.tsx` |
| Add state | `src/stores/*.ts` |
| Change app settings | `src-tauri/tauri.conf.json` |
| Add database table | `src-tauri/migrations/*.sql` |
| Add capability/permission | `src-tauri/capabilities/*.json` |

---

## Next Steps

1. Read `02-MARKET-ANALYSIS.md` for market context
2. Read `03-API-SPECIFICATION.md` for all endpoints to build
3. Read `04-IMPLEMENTATION-ROADMAP.md` for the build order
4. Read `05-PROJECT-STRUCTURE.md` for the complete file list
5. Read `06-GETTING-STARTED.md` for setup instructions
