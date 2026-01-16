# MCP Toolkit - Project Structure

> **Complete file structure with explanations for every file you'll create**

---

## Table of Contents

1. [Complete File Tree](#1-complete-file-tree)
2. [Root Configuration Files](#2-root-configuration-files)
3. [Frontend Files (src/)](#3-frontend-files)
4. [Backend Files (src-tauri/)](#4-backend-files)
5. [File Creation Order](#5-file-creation-order)

---

## 1. Complete File Tree

```
mcp-toolkit/
│
├── 📄 package.json              # Node.js dependencies & scripts
├── 📄 package-lock.json         # Locked dependency versions
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 tsconfig.node.json        # TypeScript config for Node
├── 📄 vite.config.ts            # Vite build tool configuration
├── 📄 tailwind.config.js        # Tailwind CSS configuration
├── 📄 postcss.config.js         # PostCSS configuration
├── 📄 components.json           # shadcn/ui configuration
├── 📄 .gitignore                # Git ignore rules
├── 📄 README.md                 # Project documentation
├── 📄 LICENSE                   # MIT License
│
├── 📁 src/                      # FRONTEND (React/TypeScript)
│   ├── 📄 main.tsx              # React entry point
│   ├── 📄 App.tsx               # Root component
│   ├── 📄 index.css             # Global styles + Tailwind
│   ├── 📄 vite-env.d.ts         # Vite type declarations
│   │
│   ├── 📁 components/           # React components
│   │   ├── 📁 ui/               # shadcn/ui base components
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 dialog.tsx
│   │   │   ├── 📄 form.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 select.tsx
│   │   │   ├── 📄 switch.tsx
│   │   │   ├── 📄 toast.tsx
│   │   │   ├── 📄 toaster.tsx
│   │   │   └── 📄 use-toast.ts
│   │   │
│   │   ├── 📁 layout/           # Layout components
│   │   │   ├── 📄 Sidebar.tsx   # Navigation sidebar
│   │   │   ├── 📄 Header.tsx    # Top header bar
│   │   │   └── 📄 PageContainer.tsx
│   │   │
│   │   └── 📁 features/         # Feature-specific components
│   │       ├── 📁 servers/      # Server management
│   │       │   ├── 📄 ServerList.tsx
│   │       │   ├── 📄 ServerCard.tsx
│   │       │   ├── 📄 AddServerDialog.tsx
│   │       │   ├── 📄 EditServerDialog.tsx
│   │       │   ├── 📄 DeleteServerDialog.tsx
│   │       │   ├── 📄 ServerForm.tsx
│   │       │   └── 📄 ServerStatusBadge.tsx
│   │       │
│   │       ├── 📁 clients/      # Client configuration
│   │       │   ├── 📄 ClientList.tsx
│   │       │   ├── 📄 ClientCard.tsx
│   │       │   └── 📄 ExportButton.tsx
│   │       │
│   │       └── 📁 settings/     # Settings page
│   │           ├── 📄 SettingsPage.tsx
│   │           └── 📄 ThemeToggle.tsx
│   │
│   ├── 📁 hooks/                # Custom React hooks
│   │   ├── 📄 useServers.ts     # Server CRUD hooks
│   │   ├── 📄 useClients.ts     # Client hooks
│   │   ├── 📄 useSettings.ts    # Settings hooks
│   │   └── 📄 useTauriEvent.ts  # Tauri event listener
│   │
│   ├── 📁 stores/               # Zustand state stores
│   │   ├── 📄 serverStore.ts    # Server state
│   │   ├── 📄 uiStore.ts        # UI state (modals, etc.)
│   │   └── 📄 settingsStore.ts  # Settings state
│   │
│   ├── 📁 lib/                  # Utilities
│   │   ├── 📄 utils.ts          # General helpers
│   │   ├── 📄 tauri.ts          # Tauri API wrappers
│   │   └── 📄 constants.ts      # App constants
│   │
│   └── 📁 types/                # TypeScript types
│       ├── 📄 server.ts         # Server types
│       ├── 📄 client.ts         # Client types
│       ├── 📄 settings.ts       # Settings types
│       └── 📄 events.ts         # Event types
│
├── 📁 src-tauri/                # BACKEND (Rust/Tauri)
│   ├── 📄 Cargo.toml            # Rust dependencies
│   ├── 📄 Cargo.lock            # Locked Rust dependencies
│   ├── 📄 tauri.conf.json       # Tauri configuration
│   ├── 📄 build.rs              # Build script
│   │
│   ├── 📁 src/                  # Rust source code
│   │   ├── 📄 main.rs           # Entry point
│   │   ├── 📄 lib.rs            # Library exports
│   │   ├── 📄 db.rs             # Database initialization
│   │   ├── 📄 state.rs          # App state management
│   │   │
│   │   ├── 📁 commands/         # Tauri commands (like views)
│   │   │   ├── 📄 mod.rs        # Module exports
│   │   │   ├── 📄 servers.rs    # Server CRUD commands
│   │   │   ├── 📄 clients.rs    # Client commands
│   │   │   ├── 📄 config.rs     # Config export commands
│   │   │   ├── 📄 settings.rs   # Settings commands
│   │   │   └── 📄 credentials.rs # Credential commands (v1.0)
│   │   │
│   │   ├── 📁 models/           # Data structures
│   │   │   ├── 📄 mod.rs
│   │   │   ├── 📄 server.rs
│   │   │   ├── 📄 client.rs
│   │   │   └── 📄 settings.rs
│   │   │
│   │   ├── 📁 services/         # Business logic (v1.0)
│   │   │   ├── 📄 mod.rs
│   │   │   ├── 📄 mcp_manager.rs
│   │   │   └── 📄 keychain.rs
│   │   │
│   │   └── 📁 utils/            # Helper functions
│   │       ├── 📄 mod.rs
│   │       └── 📄 paths.rs      # Platform-specific paths
│   │
│   ├── 📁 migrations/           # SQLite migrations
│   │   └── 📄 001_initial.sql
│   │
│   ├── 📁 capabilities/         # Tauri capabilities
│   │   └── 📄 default.json
│   │
│   └── 📁 icons/                # App icons
│       ├── 📄 icon.ico          # Windows
│       ├── 📄 icon.icns         # macOS
│       ├── 📄 icon.png          # Linux / general
│       ├── 📄 32x32.png
│       ├── 📄 128x128.png
│       └── 📄 128x128@2x.png
│
└── 📁 public/                   # Static assets
    └── 📄 favicon.ico
```

---

## 2. Root Configuration Files

### package.json

```json
{
  "name": "mcp-toolkit",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Tauri expects a fixed port
  server: {
    port: 1420,
    strictPort: true,
  },
  // Tauri uses this for production builds
  build: {
    target: 'esnext',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### components.json (shadcn/ui config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 3. Frontend Files

### src/main.tsx
```typescript
// Entry point - mounts React app
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### src/App.tsx
```typescript
// Root component - manages routing/navigation
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/Sidebar';
import { ServerList } from '@/components/features/servers/ServerList';
import { SettingsPage } from '@/components/features/settings/SettingsPage';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

type Page = 'servers' | 'clients' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('servers');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-auto">
          {currentPage === 'servers' && <ServerList />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### src/types/server.ts
```typescript
// Server type definitions - shared between frontend and backend
export interface Server {
  id: string;
  name: string;
  description: string | null;
  command: string;
  args: string;      // JSON string, parse with JSON.parse()
  env: string;       // JSON string
  enabled: boolean;
  category: string;
  source: string;
  marketplace_id: string | null;
  icon_url: string | null;
  documentation_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateServerInput {
  name: string;
  description?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  category?: string;
}

export interface UpdateServerInput {
  id: string;
  name?: string;
  description?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  enabled?: boolean;
  category?: string;
}

// Helper to parse JSON fields
export function parseServerArgs(server: Server): string[] {
  try {
    return JSON.parse(server.args);
  } catch {
    return [];
  }
}

export function parseServerEnv(server: Server): Record<string, string> {
  try {
    return JSON.parse(server.env);
  } catch {
    return {};
  }
}
```

### src/lib/utils.ts
```typescript
// Utility functions
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```

### src/lib/tauri.ts
```typescript
// Tauri API wrappers for type safety
import { invoke } from '@tauri-apps/api/core';
import type { Server, CreateServerInput, UpdateServerInput } from '@/types/server';

// Server commands
export const serverApi = {
  getAll: () => invoke<Server[]>('get_servers'),
  
  getOne: (id: string) => invoke<Server>('get_server', { id }),
  
  create: (input: CreateServerInput) => 
    invoke<Server>('create_server', { input }),
  
  update: (input: UpdateServerInput) => 
    invoke<Server>('update_server', { input }),
  
  delete: (id: string) => 
    invoke<void>('delete_server', { id }),
  
  toggle: (id: string) => 
    invoke<Server>('toggle_server', { id }),
};

// Config commands
export const configApi = {
  exportToClaude: () => 
    invoke<string>('export_to_claude'),
  
  exportToClient: (clientId: string) => 
    invoke<string>('export_config', { clientId }),
};

// Settings commands
export const settingsApi = {
  get: () => invoke<Record<string, any>>('get_settings'),
  
  update: (settings: Record<string, any>) => 
    invoke<void>('update_settings', { settings }),
};
```

### src/stores/serverStore.ts
```typescript
// Zustand store for server state
import { create } from 'zustand';
import { serverApi } from '@/lib/tauri';
import type { Server, CreateServerInput, UpdateServerInput } from '@/types/server';

interface ServerState {
  servers: Server[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchServers: () => Promise<void>;
  createServer: (input: CreateServerInput) => Promise<Server>;
  updateServer: (input: UpdateServerInput) => Promise<Server>;
  deleteServer: (id: string) => Promise<void>;
  toggleServer: (id: string) => Promise<Server>;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  loading: false,
  error: null,

  fetchServers: async () => {
    set({ loading: true, error: null });
    try {
      const servers = await serverApi.getAll();
      set({ servers, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  createServer: async (input) => {
    const server = await serverApi.create(input);
    set((state) => ({ servers: [...state.servers, server] }));
    return server;
  },

  updateServer: async (input) => {
    const server = await serverApi.update(input);
    set((state) => ({
      servers: state.servers.map((s) => (s.id === server.id ? server : s)),
    }));
    return server;
  },

  deleteServer: async (id) => {
    await serverApi.delete(id);
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== id),
    }));
  },

  toggleServer: async (id) => {
    const server = await serverApi.toggle(id);
    set((state) => ({
      servers: state.servers.map((s) => (s.id === server.id ? server : s)),
    }));
    return server;
  },
}));
```

### src/components/layout/Sidebar.tsx
```typescript
// Navigation sidebar component
import { cn } from '@/lib/utils';
import { Server, Settings, Monitor } from 'lucide-react';

type Page = 'servers' | 'clients' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'servers' as const, label: 'Servers', icon: Server },
  { id: 'clients' as const, label: 'Clients', icon: Monitor },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">MCP Toolkit</h1>
        <p className="text-sm text-muted-foreground">Manage your AI tools</p>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              currentPage === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

---

## 4. Backend Files

### src-tauri/Cargo.toml
```toml
[package]
name = "mcp-toolkit"
version = "0.1.0"
description = "Visual MCP Server Manager"
authors = ["Your Name"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite"] }
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["v4", "serde"] }
dirs = "5"
thiserror = "1"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

### src-tauri/tauri.conf.json
```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "MCP Toolkit",
  "identifier": "com.mcptoolkit.app",
  "version": "0.1.0",
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "MCP Toolkit",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "targets": "all",
    "macOS": {
      "minimumSystemVersion": "10.13"
    }
  }
}
```

### src-tauri/src/main.rs
```rust
// Main entry point - initializes app and registers commands

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;
mod state;
mod utils;

use state::AppState;

#[tokio::main]
async fn main() {
    // Initialize database
    let db = db::init_db()
        .await
        .expect("Failed to initialize database");
    
    let state = AppState::new(db);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            // Server commands
            commands::servers::get_servers,
            commands::servers::get_server,
            commands::servers::create_server,
            commands::servers::update_server,
            commands::servers::delete_server,
            commands::servers::toggle_server,
            // Config commands
            commands::config::export_to_claude,
            commands::config::export_config,
            commands::config::get_claude_config_path,
            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### src-tauri/src/db.rs
```rust
// Database initialization and migrations

use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::PathBuf;

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    let db_path = get_db_path();
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .expect("Failed to create database directory");
    }
    
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    
    // Run migrations
    run_migrations(&pool).await?;
    
    Ok(pool)
}

fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .expect("Could not determine data directory")
        .join("mcp-toolkit");
    
    data_dir.join("data.db")
}

async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create tables if they don't exist
    sqlx::query(include_str!("../migrations/001_initial.sql"))
        .execute(pool)
        .await?;
    
    Ok(())
}
```

### src-tauri/src/state.rs
```rust
// Application state management

use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub db: Arc<Mutex<SqlitePool>>,
}

impl AppState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
        }
    }
}
```

### src-tauri/src/models/mod.rs
```rust
// Model exports

pub mod server;
pub mod settings;
```

### src-tauri/src/models/server.rs
```rust
// Server model and input types

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: String,
    pub env: String,
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
    pub env: Option<HashMap<String, String>>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServerInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub command: Option<String>,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub enabled: Option<bool>,
    pub category: Option<String>,
}
```

### src-tauri/src/commands/mod.rs
```rust
// Command module exports

pub mod servers;
pub mod config;
pub mod settings;
```

### src-tauri/src/commands/servers.rs
```rust
// Server CRUD commands

use tauri::State;
use crate::state::AppState;
use crate::models::server::{Server, CreateServerInput, UpdateServerInput};

#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    let db = state.db.lock().await;
    
    sqlx::query_as::<_, Server>("SELECT * FROM servers ORDER BY name")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))
}

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
        .map_err(|e| format!("Server not found: {}", e))
}

#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    input: CreateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let args_json = serde_json::to_string(&input.args.unwrap_or_default())
        .map_err(|e| e.to_string())?;
    let env_json = serde_json::to_string(&input.env.unwrap_or_default())
        .map_err(|e| e.to_string())?;
    let category = input.category.unwrap_or_else(|| "other".to_string());

    sqlx::query(
        "INSERT INTO servers (id, name, description, command, args, env, enabled, category, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'local', ?, ?)"
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.command)
    .bind(&args_json)
    .bind(&env_json)
    .bind(&category)
    .bind(&now)
    .bind(&now)
    .execute(&*db)
    .await
    .map_err(|e| format!("Failed to create server: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_server(
    state: State<'_, AppState>,
    input: UpdateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    
    // Fetch existing
    let mut server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&input.id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    // Apply updates
    if let Some(name) = input.name { server.name = name; }
    if let Some(desc) = input.description { server.description = Some(desc); }
    if let Some(cmd) = input.command { server.command = cmd; }
    if let Some(args) = input.args { 
        server.args = serde_json::to_string(&args).map_err(|e| e.to_string())?;
    }
    if let Some(env) = input.env { 
        server.env = serde_json::to_string(&env).map_err(|e| e.to_string())?;
    }
    if let Some(enabled) = input.enabled { server.enabled = enabled; }
    if let Some(cat) = input.category { server.category = cat; }
    
    server.updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE servers SET name = ?, description = ?, command = ?, args = ?, env = ?, enabled = ?, category = ?, updated_at = ? WHERE id = ?"
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
    .map_err(|e| format!("Failed to update server: {}", e))?;

    Ok(server)
}

#[tauri::command]
pub async fn delete_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let db = state.db.lock().await;
    
    sqlx::query("DELETE FROM servers WHERE id = ?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to delete server: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn toggle_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query("UPDATE servers SET enabled = NOT enabled, updated_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to toggle server: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
}
```

### src-tauri/migrations/001_initial.sql
```sql
-- Initial database schema

CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    command TEXT NOT NULL,
    args TEXT DEFAULT '[]',
    env TEXT DEFAULT '{}',
    enabled INTEGER DEFAULT 0,
    category TEXT DEFAULT 'other',
    source TEXT DEFAULT 'local',
    marketplace_id TEXT,
    icon_url TEXT,
    documentation_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_servers_enabled ON servers(enabled);
CREATE INDEX IF NOT EXISTS idx_servers_category ON servers(category);

-- Default settings
INSERT OR IGNORE INTO settings (key, value, updated_at) 
VALUES ('theme', '"system"', datetime('now'));

INSERT OR IGNORE INTO settings (key, value, updated_at) 
VALUES ('auto_export', 'true', datetime('now'));
```

---

## 5. File Creation Order

### Phase 0: Project Setup (Day 1-2)

```bash
# 1. Create Tauri project
cargo create-tauri-app mcp-toolkit
cd mcp-toolkit

# 2. Install dependencies
npm install
npm install zustand @tanstack/react-query lucide-react clsx tailwind-merge class-variance-authority

# 3. Setup Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog form input label select switch toast
```

### Phase 1: Backend Core (Day 3-4)

Create in order:
1. `src-tauri/Cargo.toml` - Add dependencies
2. `src-tauri/migrations/001_initial.sql` - Database schema
3. `src-tauri/src/models/mod.rs` - Model exports
4. `src-tauri/src/models/server.rs` - Server model
5. `src-tauri/src/db.rs` - Database init
6. `src-tauri/src/state.rs` - App state
7. `src-tauri/src/commands/mod.rs` - Command exports
8. `src-tauri/src/commands/servers.rs` - Server commands
9. `src-tauri/src/main.rs` - Wire everything together

### Phase 2: Frontend Core (Day 5-7)

Create in order:
1. `src/types/server.ts` - Type definitions
2. `src/lib/utils.ts` - Utilities
3. `src/lib/tauri.ts` - API wrappers
4. `src/stores/serverStore.ts` - State store
5. `src/index.css` - Styles
6. `src/components/layout/Sidebar.tsx` - Navigation
7. `src/components/features/servers/ServerCard.tsx` - Server display
8. `src/components/features/servers/ServerList.tsx` - Server list
9. `src/App.tsx` - Root component
10. `src/main.tsx` - Entry point

### Phase 3: Polish (Day 8-10)

Add remaining files:
1. `src/components/features/servers/AddServerDialog.tsx`
2. `src/components/features/servers/EditServerDialog.tsx`
3. `src/components/features/servers/ServerForm.tsx`
4. `src/components/features/settings/SettingsPage.tsx`
5. `src-tauri/src/commands/config.rs` - Export commands
6. `src-tauri/src/commands/settings.rs` - Settings commands

---

*Next: Read `06-GETTING-STARTED.md` for step-by-step setup instructions*
