# MCP Toolkit - Getting Started Guide

> **Step-by-step instructions to set up your development environment and build your first feature**

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Project Creation](#3-project-creation)
4. [Your First Feature: Hello World](#4-your-first-feature-hello-world)
5. [Building the Server List](#5-building-the-server-list)
6. [Common Issues & Solutions](#6-common-issues--solutions)
7. [Development Workflow](#7-development-workflow)
8. [Cheat Sheets](#8-cheat-sheets)

---

## 1. Prerequisites

### What You Need Installed

| Tool | Purpose | How to Check |
|------|---------|--------------|
| **Node.js 20+** | JavaScript runtime | `node --version` |
| **Rust** | Backend language | `rustc --version` |
| **Git** | Version control | `git --version` |
| **VS Code** | Code editor (recommended) | - |

### System Requirements

| OS | Minimum | Recommended |
|----|---------|-------------|
| macOS | 10.13+ | 12.0+ (Monterey) |
| Windows | 10+ | 11 |
| Linux | Ubuntu 18.04+ | Ubuntu 22.04+ |

---

## 2. Environment Setup

### Step 1: Install Node.js

**macOS/Linux (using nvm - recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Windows:**
1. Download from https://nodejs.org (LTS version)
2. Run installer
3. Open new PowerShell, verify with `node --version`

### Step 2: Install Rust

**All platforms:**
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow prompts (press 1 for default installation)

# Add to PATH (restart terminal or run):
source ~/.cargo/env

# Verify
rustc --version  # Should show 1.70+ 
cargo --version  # Should show 1.70+
```

**Windows alternative:**
1. Download from https://rustup.rs
2. Run installer
3. May need to install Visual Studio C++ Build Tools

### Step 3: Install Tauri CLI

```bash
# Install Tauri CLI globally
cargo install create-tauri-app
cargo install tauri-cli

# Verify
cargo tauri --version  # Should show 2.x.x
```

### Step 4: Install VS Code Extensions (Recommended)

Open VS Code and install:
1. **rust-analyzer** - Rust language support
2. **Tauri** - Tauri-specific features
3. **ESLint** - JavaScript linting
4. **Prettier** - Code formatting
5. **Tailwind CSS IntelliSense** - Tailwind autocomplete

```bash
# Or install via command line:
code --install-extension rust-lang.rust-analyzer
code --install-extension tauri-apps.tauri-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

### Step 5: Platform-Specific Dependencies

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Windows:**
- Visual Studio 2022 with "Desktop development with C++" workload
- Or: Visual Studio Build Tools 2022

---

## 3. Project Creation

### Step 1: Create New Tauri Project

```bash
# Navigate to your projects folder
cd ~/projects  # or wherever you keep projects

# Create new Tauri + React + TypeScript project
cargo create-tauri-app mcp-toolkit

# When prompted:
# ✔ Project name: mcp-toolkit
# ✔ Choose which language to use for your frontend: TypeScript / JavaScript
# ✔ Choose your package manager: npm
# ✔ Choose your UI template: React
# ✔ Choose your UI flavor: TypeScript
```

### Step 2: Enter Project and Install Dependencies

```bash
cd mcp-toolkit

# Install Node dependencies
npm install

# Test that it runs
npm run tauri dev
```

**Expected Result:** A window opens showing the default Tauri + React app.

Press `Ctrl+C` in terminal to stop.

### Step 3: Add Additional Dependencies

```bash
# Frontend dependencies
npm install zustand @tanstack/react-query lucide-react
npm install clsx tailwind-merge class-variance-authority

# Development dependencies  
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
```

### Step 4: Setup Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Replace `src/styles.css` content with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5: Setup shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted:
# ✔ Would you like to use TypeScript? yes
# ✔ Which style would you like to use? Default
# ✔ Which color would you like to use as base color? Slate
# ✔ Where is your global CSS file? src/styles.css
# ✔ Would you like to use CSS variables for colors? yes
# ✔ Are you using a custom tailwind prefix? no
# ✔ Where is your tailwind.config.js located? tailwind.config.js
# ✔ Configure the import alias for components? @/components
# ✔ Configure the import alias for utils? @/lib/utils
# ✔ Are you using React Server Components? no

# Add components we'll need
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
```

### Step 6: Add Path Aliases

Edit `tsconfig.json` to add path aliases:
```json
{
  "compilerOptions": {
    // ... existing options ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Edit `vite.config.ts`:
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
  server: {
    port: 1420,
    strictPort: true,
  },
});
```

### Step 7: Add Rust Dependencies

Edit `src-tauri/Cargo.toml`:
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
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite"] }
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["v4", "serde"] }
dirs = "5"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

Then update Rust dependencies:
```bash
cd src-tauri
cargo update
cd ..
```

### Step 8: Verify Everything Works

```bash
npm run tauri dev
```

If you see the app window, you're ready to start building!

---

## 4. Your First Feature: Hello World

Let's build a simple feature to understand the Tauri workflow.

### Goal: Create a button that calls Rust and displays the result

### Step 1: Create the Rust Command

Edit `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// This is a Tauri command - callable from JavaScript
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to MCP Toolkit.", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // Register the command here
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 2: Call from React

Edit `src/App.tsx`:

```tsx
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function App() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  async function handleGreet() {
    // This calls the Rust function!
    const result = await invoke<string>('greet', { name });
    setGreeting(result);
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8">MCP Toolkit</h1>
      
      <div className="flex gap-4 max-w-md">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <Button onClick={handleGreet}>
          Greet
        </Button>
      </div>
      
      {greeting && (
        <p className="mt-4 text-lg text-green-600">{greeting}</p>
      )}
    </div>
  );
}

export default App;
```

### Step 3: Test It

```bash
npm run tauri dev
```

1. Enter your name in the input
2. Click "Greet"
3. See the greeting from Rust!

**Congratulations!** You just:
- Created a Rust function
- Called it from JavaScript
- Displayed the result in React

This is the core pattern for everything in Tauri.

---

## 5. Building the Server List

Now let's build the actual MVP feature: a list of MCP servers.

### Step 1: Create Database Migration

Create `src-tauri/migrations/001_initial.sql`:

```sql
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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_servers_enabled ON servers(enabled);
```

### Step 2: Create Database Module

Create `src-tauri/src/db.rs`:

```rust
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::PathBuf;

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    let db_path = get_db_path();
    
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
    sqlx::query(include_str!("../migrations/001_initial.sql"))
        .execute(&pool)
        .await?;
    
    Ok(pool)
}

fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .expect("Could not determine data directory")
        .join("mcp-toolkit")
        .join("data.db")
}
```

### Step 3: Create State Module

Create `src-tauri/src/state.rs`:

```rust
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

### Step 4: Create Server Model

Create `src-tauri/src/models.rs`:

```rust
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
```

### Step 5: Create Server Commands

Create `src-tauri/src/commands.rs`:

```rust
use tauri::State;
use crate::state::AppState;
use crate::models::{Server, CreateServerInput};

#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    let db = state.db.lock().await;
    
    sqlx::query_as::<_, Server>("SELECT * FROM servers ORDER BY name")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))
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
    .map_err(|e| format!("Failed to create: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
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
        .map_err(|e| format!("Failed to toggle: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
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
        .map_err(|e| format!("Failed to delete: {}", e))?;

    Ok(())
}
```

### Step 6: Update Main.rs

Update `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod state;
mod models;
mod commands;

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
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_servers,
            commands::create_server,
            commands::toggle_server,
            commands::delete_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 7: Create TypeScript Types

Create `src/types/server.ts`:

```typescript
export interface Server {
  id: string;
  name: string;
  description: string | null;
  command: string;
  args: string;
  env: string;
  enabled: boolean;
  category: string;
  source: string;
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
```

### Step 8: Create the UI

Update `src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { Server, CreateServerInput } from '@/types/server';

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');

  async function fetchServers() {
    try {
      const result = await invoke<Server[]>('get_servers');
      setServers(result);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const input: CreateServerInput = {
        name,
        command,
        description: description || undefined,
      };
      await invoke('create_server', { input });
      await fetchServers();
      setDialogOpen(false);
      setName('');
      setCommand('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create server:', error);
    }
  }

  async function handleToggle(id: string) {
    try {
      const updated = await invoke<Server>('toggle_server', { id });
      setServers(servers.map(s => s.id === id ? updated : s));
    } catch (error) {
      console.error('Failed to toggle server:', error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await invoke('delete_server', { id });
      setServers(servers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete server:', error);
    }
  }

  useEffect(() => {
    fetchServers();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">MCP Toolkit</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Server
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add MCP Server</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., GitHub"
                  />
                </div>
                <div>
                  <Label htmlFor="command">Command</Label>
                  <Input
                    id="command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="e.g., npx -y @modelcontextprotocol/server-github"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this server do?"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Server
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {servers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No servers configured yet. Add your first server to get started!
              </CardContent>
            </Card>
          ) : (
            servers.map((server) => (
              <Card key={server.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{server.name}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={server.enabled}
                      onCheckedChange={() => handleToggle(server.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(server.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {server.description || 'No description'}
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {server.command}
                  </code>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Step 9: Test It!

```bash
npm run tauri dev
```

You should now have a working app where you can:
- ✅ View list of servers
- ✅ Add new servers
- ✅ Toggle servers on/off
- ✅ Delete servers

---

## 6. Common Issues & Solutions

### Rust Compilation Errors

**Problem:** `cannot find value 'state' in this scope`
```rust
// Wrong - missing State import
pub async fn get_servers(state: AppState) -> Result<...>

// Correct - use State wrapper
use tauri::State;
pub async fn get_servers(state: State<'_, AppState>) -> Result<...>
```

**Problem:** `the trait bound 'Server: FromRow<'_, SqliteRow>' is not satisfied`
```rust
// Make sure your struct derives FromRow
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Server { ... }
```

**Problem:** Database file not found
```bash
# Check if the directory exists
ls ~/Library/Application\ Support/mcp-toolkit/  # macOS
ls ~/.local/share/mcp-toolkit/                  # Linux
```

### Frontend Issues

**Problem:** `invoke is not a function`
```typescript
// Wrong import
import { invoke } from '@tauri-apps/api';

// Correct import (Tauri 2.0)
import { invoke } from '@tauri-apps/api/core';
```

**Problem:** `Cannot find module '@/components/ui/button'`
```bash
# Make sure you added the shadcn component
npx shadcn-ui@latest add button
```

**Problem:** Styles not applying
```css
/* Make sure your CSS file has Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Build Issues

**Problem:** `error: linker 'cc' not found`
```bash
# Linux - install build tools
sudo apt install build-essential

# macOS - install Xcode tools
xcode-select --install
```

**Problem:** `SQLITE_LOCKED` or database busy
```rust
// Make sure you're using proper async with Mutex
let db = state.db.lock().await;  // Use .await!
```

---

## 7. Development Workflow

### Daily Routine

```bash
# 1. Start development server
npm run tauri dev

# 2. Make changes to code
#    - Rust changes: app auto-reloads (may take a few seconds)
#    - React changes: hot module replacement (instant)

# 3. Check for errors in terminal

# 4. Commit regularly
git add .
git commit -m "feat: add server toggle functionality"
```

### File Editing Tips

**When editing Rust:**
1. Save the file
2. Wait for cargo to recompile (watch terminal)
3. App will auto-reload when ready

**When editing React:**
1. Save the file
2. Changes appear instantly (HMR)

### Debugging

**Rust debugging:**
```rust
// Add debug prints
println!("Debug: {:?}", some_variable);
dbg!(some_variable);  // Even more detailed
```

**JavaScript debugging:**
```typescript
// Use browser console
console.log('Debug:', someVariable);

// Open DevTools in Tauri app
// Right-click > Inspect Element
```

### Building for Production

```bash
# Build release version
npm run tauri build

# Output locations:
# macOS: src-tauri/target/release/bundle/dmg/
# Windows: src-tauri/target/release/bundle/msi/
# Linux: src-tauri/target/release/bundle/deb/
```

---

## 8. Cheat Sheets

### Rust Quick Reference

```rust
// Variables
let name = "hello";           // Immutable (default)
let mut count = 0;            // Mutable

// Types
let s: String = String::from("hello");
let n: i32 = 42;
let b: bool = true;
let v: Vec<String> = vec![];

// Functions
fn add(a: i32, b: i32) -> i32 {
    a + b  // No semicolon = return
}

// Error handling
fn might_fail() -> Result<String, String> {
    Ok("success".to_string())  // Success
    // Err("failed".to_string()) // Error
}

// Using Result
let result = might_fail()?;  // Propagate error
let result = might_fail().map_err(|e| e.to_string())?;  // Convert error

// Structs
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Person {
    name: String,
    age: u32,
}

// Async
async fn fetch_data() -> Result<Data, Error> {
    let data = some_async_call().await?;
    Ok(data)
}
```

### Tauri Command Pattern

```rust
// Backend (Rust)
#[tauri::command]
async fn my_command(
    state: State<'_, AppState>,  // Shared state
    input: MyInput,               // From JavaScript
) -> Result<MyOutput, String> {   // Return to JavaScript
    // Do stuff
    Ok(output)
}

// Register in main.rs
.invoke_handler(tauri::generate_handler![my_command])
```

```typescript
// Frontend (TypeScript)
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<MyOutput>('my_command', { 
  input: { ... } 
});
```

### SQLx Quick Reference

```rust
// Query returning multiple rows
let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers")
    .fetch_all(&*db)
    .await?;

// Query returning single row
let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
    .bind(&id)
    .fetch_one(&*db)
    .await?;

// Execute (INSERT, UPDATE, DELETE)
sqlx::query("INSERT INTO servers (id, name) VALUES (?, ?)")
    .bind(&id)
    .bind(&name)
    .execute(&*db)
    .await?;
```

### Zustand Quick Reference

```typescript
import { create } from 'zustand';

interface Store {
  count: number;
  items: Item[];
  increment: () => void;
  addItem: (item: Item) => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  items: [],
  increment: () => set((state) => ({ count: state.count + 1 })),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// Usage in component
function Component() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

### Useful Commands

```bash
# Development
npm run tauri dev          # Start dev server
npm run build              # Build frontend only
npm run tauri build        # Build full app

# Rust
cargo check                # Check for errors (fast)
cargo build                # Build (slower)
cargo fmt                  # Format code
cargo clippy               # Linting

# Adding components
npx shadcn-ui@latest add [component]

# Git
git status
git add .
git commit -m "message"
git push
```

---

## You're Ready!

You now have:
- ✅ Development environment set up
- ✅ Understanding of Tauri architecture
- ✅ Working "Hello World" feature
- ✅ Server list with CRUD operations
- ✅ Knowledge to debug common issues

**Next steps:**
1. Add config export functionality (see `04-IMPLEMENTATION-ROADMAP.md`)
2. Polish the UI
3. Test on different platforms
4. Launch! 🚀

---

*Questions? Check the other documents or search the Tauri Discord community.*
