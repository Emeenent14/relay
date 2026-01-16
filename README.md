# Relay - MCP Server Management Toolkit

Relay is a desktop application for managing Model Context Protocol (MCP) servers. It provides a user-friendly interface to configure, enable/disable, and export MCP servers for use with Claude Desktop and other AI applications.

## 🎯 What is Relay?

Relay simplifies the management of MCP servers - specialized tools that extend the capabilities of AI assistants like Claude. Instead of manually editing configuration files, Relay provides:

- **Visual Server Management**: Add, edit, and organize your MCP servers through an intuitive UI
- **One-Click Export**: Automatically export your enabled servers to Claude Desktop's configuration
- **Server Categories**: Organize servers by type (AI, Database, DevTools, Web, Communication, etc.)
- **Settings Management**: Configure app behavior and theme preferences
- **Local Database**: All your configurations are stored locally and privately

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI library with the latest features
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Zustand** - Lightweight state management (simpler alternative to Redux)
- **shadcn/ui** - Beautiful, accessible UI components

### Backend
- **Tauri 2.0** - Rust-based desktop framework (lighter and more secure than Electron)
- **Rust** - System programming language for the backend
- **SQLite** - Embedded database for storing server configurations
- **sqlx** - Async SQL toolkit for Rust

## 📁 Project Structure

```
relay/
├── src/                          # Frontend source code (React + TypeScript)
│   ├── components/               # React components
│   │   ├── features/            # Feature-specific components
│   │   │   ├── servers/         # Server management components
│   │   │   └── settings/        # Settings components
│   │   ├── layout/              # Layout components (Sidebar)
│   │   └── ui/                  # Base UI components (shadcn/ui)
│   ├── lib/                     # Utilities and helpers
│   │   ├── tauri.ts            # Tauri API wrappers
│   │   ├── utils.ts            # General utilities
│   │   └── constants.ts        # App constants
│   ├── stores/                  # Zustand state stores
│   │   ├── serverStore.ts      # Server state management
│   │   ├── settingsStore.ts    # Settings state management
│   │   └── uiStore.ts          # UI state management
│   ├── types/                   # TypeScript type definitions
│   │   ├── server.ts           # Server-related types
│   │   └── settings.ts         # Settings types
│   ├── App.tsx                 # Root React component
│   └── main.tsx                # React entry point
├── src-tauri/                   # Backend source code (Rust + Tauri)
│   ├── src/
│   │   ├── commands/           # Tauri command handlers (API endpoints)
│   │   │   ├── servers.rs      # Server CRUD operations
│   │   │   ├── config.rs       # Config export operations
│   │   │   ├── settings.rs     # Settings operations
│   │   │   └── mod.rs          # Module exports
│   │   ├── models/             # Data models
│   │   │   ├── server.rs       # Server model
│   │   │   ├── settings.rs     # Settings model
│   │   │   └── mod.rs          # Module exports
│   │   ├── utils/              # Utility functions
│   │   │   ├── paths.rs        # Path resolution utilities
│   │   │   └── mod.rs          # Module exports
│   │   ├── db.rs              # Database initialization
│   │   ├── state.rs           # Application state
│   │   └── main.rs            # Rust entry point
│   ├── migrations/             # Database migrations
│   │   └── 001_initial.sql    # Initial schema
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Tauri configuration
├── public/                     # Static assets
├── package.json               # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

## 🎨 Architecture Overview

### How Tauri Works

Tauri combines a **Rust backend** with a **web frontend** (React in our case):

```
┌─────────────────────────────────────────────────────┐
│                  Desktop Window                      │
├─────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                      │
│  - UI Components                                     │
│  - State Management (Zustand)                       │
│  - Calls Rust via invoke()                          │
│                      ↕                               │
│  IPC (Inter-Process Communication)                  │
│                      ↕                               │
│  Backend (Rust + Tauri)                             │
│  - Commands (API endpoints)                         │
│  - Database (SQLite)                                │
│  - File System Access                               │
└─────────────────────────────────────────────────────┘
```

### Frontend → Backend Communication

The frontend calls Rust functions using Tauri's `invoke()` API:

```typescript
// Frontend (TypeScript)
import { invoke } from '@tauri-apps/api/core';

const servers = await invoke<Server[]>('get_servers');
```

```rust
// Backend (Rust)
#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    // Database operations...
}
```

### State Management

**Frontend State (Zustand)**:
- **serverStore**: Manages server list, CRUD operations
- **settingsStore**: Manages app settings
- **uiStore**: Manages UI state (current page, dialogs)

**Backend State (Rust)**:
- **AppState**: Holds database connection pool
- Managed by Tauri's state system

### Database Schema

**servers table**:
```sql
CREATE TABLE servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    command TEXT NOT NULL,
    args TEXT NOT NULL,          -- JSON array
    env TEXT NOT NULL,           -- JSON object
    enabled BOOLEAN DEFAULT 0,
    category TEXT DEFAULT 'other',
    source TEXT DEFAULT 'local',
    marketplace_id TEXT,
    icon_url TEXT,
    documentation_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
```

**settings table**:
```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)
```

## 🔧 Features

### Server Management
- **Add Servers**: Create new MCP server configurations
- **Edit Servers**: Modify existing server settings
- **Delete Servers**: Remove servers you no longer need
- **Enable/Disable**: Toggle servers on/off without deleting them
- **Categorization**: Organize servers by category (AI, Database, DevTools, etc.)

### Configuration Export
- **Export to Claude Desktop**: One-click export of enabled servers to Claude Desktop's config file
- **Auto-Export**: Optionally export automatically when servers are enabled/disabled
- **Cross-Platform**: Works on Windows, macOS, and Linux

### Settings
- **Theme Selection**: Light, Dark, or System theme
- **Auto-Export**: Toggle automatic config export

## 🚀 Getting Started

See [SETUP.md](./SETUP.md) for detailed setup and installation instructions.

## 🧑‍💻 Development

### Key Concepts for Tauri Development

1. **Commands**: Rust functions decorated with `#[tauri::command]` that can be called from the frontend
2. **State Management**: Backend state is managed via Tauri's `.manage()` API
3. **IPC**: Communication between frontend and backend happens through the `invoke()` API
4. **Async/Await**: Both frontend and backend use async/await patterns

### Frontend Development

The frontend uses standard React patterns:
- Components are in `src/components/`
- State management via Zustand stores
- Type-safe API calls through `src/lib/tauri.ts` wrappers

### Backend Development

The backend follows Rust conventions:
- Commands in `src-tauri/src/commands/`
- Models in `src-tauri/src/models/`
- Database operations use sqlx with async/await

## 📝 API Reference

### Server Commands

- `get_servers()` - Fetch all servers
- `get_server(id)` - Fetch a single server
- `create_server(input)` - Create a new server
- `update_server(input)` - Update an existing server
- `delete_server(id)` - Delete a server
- `toggle_server(id)` - Toggle server enabled status

### Config Commands

- `get_claude_config_path()` - Get Claude Desktop config path
- `export_to_claude()` - Export enabled servers to Claude Desktop
- `export_config(client_id)` - Export config for a specific client
- `read_claude_config()` - Read current Claude Desktop config

### Settings Commands

- `get_settings()` - Get all settings
- `update_settings(settings)` - Update settings
- `get_setting(key)` - Get a single setting
- `update_setting(key, value)` - Update a single setting

## 🔐 Security

- All data is stored locally on your machine
- No telemetry or external network calls
- Database file is stored in your user data directory
- Tauri's security model prevents unauthorized access to system resources

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

## 💬 Support

[Add support information here]

---

Built with ❤️ using Tauri, React, and Rust
