# Relay - Setup Guide

This guide will walk you through setting up Relay from scratch. No prior Tauri experience required!

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Project Setup](#project-setup)
4. [Running the Application](#running-the-application)
5. [Building for Production](#building-for-production)
6. [Troubleshooting](#troubleshooting)
7. [Understanding the Stack](#understanding-the-stack)

---

## Prerequisites

Relay requires the following tools to be installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Used for frontend development and package management
   - Download from: https://nodejs.org/

2. **Rust** (latest stable version)
   - Used for Tauri backend development
   - Install via rustup: https://rustup.rs/

3. **System Dependencies** (varies by platform)

#### Windows
- **Microsoft Visual Studio C++ Build Tools**
  - Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
  - Install "Desktop development with C++" workload
  - This is required for Rust to compile native code

#### macOS
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

---

## Installing Prerequisites

### Step 1: Install Node.js

1. Visit https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts
4. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

### Step 2: Install Rust

1. Visit https://rustup.rs/
2. Follow the instructions for your platform:

   **Windows:**
   - Download and run `rustup-init.exe`
   - Follow the prompts (default options are fine)
   - Restart your terminal after installation

   **macOS/Linux:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. Verify installation:
   ```bash
   rustc --version  # Should show rustc 1.xx.x
   cargo --version  # Should show cargo 1.xx.x
   ```

### Step 3: Install Tauri CLI

```bash
cargo install tauri-cli
```

This installs the Tauri command-line tool globally.

---

## Project Setup

### Step 1: Clone or Download the Project

If you have the project files, navigate to the project directory:

```bash
cd path/to/relay
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This installs all the frontend dependencies listed in `package.json`:
- React, TypeScript, Vite
- Zustand (state management)
- Tailwind CSS
- Tauri API packages
- UI component dependencies

**This may take a few minutes.**

### Step 3: Install Rust Dependencies

The Rust dependencies will be automatically installed when you first run the app, but you can install them manually:

```bash
cd src-tauri
cargo build
cd ..
```

This downloads and compiles all Rust dependencies listed in `src-tauri/Cargo.toml`.

**This will take several minutes on first run** as it compiles all dependencies.

---

## Running the Application

### Development Mode

To run the app in development mode (with hot-reload):

```bash
npm run tauri:dev
```

**What happens:**
1. Vite starts the frontend dev server (usually on http://localhost:1420)
2. Tauri compiles the Rust backend
3. A desktop window opens with your app
4. Changes to frontend code auto-reload
5. Changes to Rust code require restarting the command

**First run will take 5-10 minutes** as Rust compiles everything. Subsequent runs are much faster (30-60 seconds).

### Stopping the Development Server

Press `Ctrl+C` in the terminal to stop the dev server.

---

## Building for Production

To create a production build of the app:

```bash
npm run tauri:build
```

**What happens:**
1. Vite builds an optimized frontend bundle
2. Rust compiles the backend in release mode (with optimizations)
3. Tauri packages everything into a platform-specific installer

**Build time:** 5-15 minutes depending on your system.

**Build artifacts** will be located in:
- `src-tauri/target/release/bundle/`

### Platform-Specific Outputs

**Windows:**
- `.msi` - Windows Installer
- `.exe` - Standalone executable

**macOS:**
- `.dmg` - Disk image
- `.app` - Application bundle

**Linux:**
- `.deb` - Debian package
- `.AppImage` - Universal Linux package

---

## Troubleshooting

### Common Issues

#### Issue: "command not found: cargo"

**Solution:** Rust is not installed or not in your PATH.
- Reinstall Rust from https://rustup.rs/
- Restart your terminal
- On Windows, you may need to restart your computer

---

#### Issue: "error: Microsoft Visual C++ 14.0 or greater is required" (Windows)

**Solution:** Install Visual Studio C++ Build Tools
1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++" workload
3. Restart your terminal

---

#### Issue: "webkit2gtk not found" (Linux)

**Solution:** Install system dependencies:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev build-essential
```

---

#### Issue: Build takes forever / Build hangs

**Solution:**
- Rust compilation is slow on first build (this is normal)
- Ensure you have at least 4GB of free RAM
- Close other resource-intensive applications
- On slow systems, first build can take 15-20 minutes

---

#### Issue: "Failed to initialize database"

**Solution:** Check file permissions
- On Windows: Ensure you have write access to `%APPDATA%\com.relay.app\`
- On macOS: Ensure you have write access to `~/Library/Application Support/com.relay.app/`
- On Linux: Ensure you have write access to `~/.local/share/com.relay.app/`

---

#### Issue: Port 1420 already in use

**Solution:** Kill the process using port 1420 or change the port in `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "devPath": "http://localhost:3000"  // Change to another port
  }
}
```

Then update `vite.config.ts` to match:
```typescript
export default defineConfig({
  server: {
    port: 3000,  // Match the port
  },
});
```

---

## Understanding the Stack

### What is Tauri?

Think of Tauri like a car:
- **Rust backend** = Engine (powerful, efficient)
- **Web frontend** (React) = Interior (what you see and interact with)
- **Tauri** = Frame that connects them together

Traditional desktop apps use Electron (which bundles an entire Chrome browser). Tauri uses the operating system's built-in web renderer, making apps:
- **Smaller:** 10-20MB instead of 100-200MB
- **Faster:** Less memory usage
- **More secure:** Rust's memory safety prevents many bugs

### How Frontend and Backend Communicate

**Frontend (TypeScript):**
```typescript
import { invoke } from '@tauri-apps/api/core';

// Call a Rust function
const servers = await invoke<Server[]>('get_servers');
```

**Backend (Rust):**
```rust
#[tauri::command]  // This decorator exposes the function to the frontend
pub async fn get_servers() -> Result<Vec<Server>, String> {
    // Database logic...
}
```

The `invoke()` function sends a message from JavaScript to Rust, and Rust sends the result back. This is called **IPC (Inter-Process Communication)**.

### Project File Overview

**Important Frontend Files:**
- `src/App.tsx` - Root React component, handles routing
- `src/lib/tauri.ts` - Type-safe wrappers for calling Rust functions
- `src/stores/*.ts` - Zustand stores for state management
- `src/components/` - React UI components

**Important Backend Files:**
- `src-tauri/src/main.rs` - Rust entry point, registers all commands
- `src-tauri/src/commands/*.rs` - API endpoints (Rust functions the frontend can call)
- `src-tauri/src/db.rs` - Database initialization
- `src-tauri/migrations/` - SQL schema definitions

**Configuration Files:**
- `package.json` - Frontend dependencies
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri app configuration (name, window size, etc.)
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript configuration

---

## Development Workflow

### Making Changes to the Frontend

1. Edit files in `src/`
2. Save the file
3. Changes auto-reload in the app window

### Making Changes to the Backend

1. Edit files in `src-tauri/src/`
2. Save the file
3. Stop the dev server (`Ctrl+C`)
4. Restart: `npm run tauri:dev`

### Adding a New Rust Command

1. Create function in `src-tauri/src/commands/`:
   ```rust
   #[tauri::command]
   pub async fn my_new_command() -> Result<String, String> {
       Ok("Hello from Rust!".to_string())
   }
   ```

2. Register it in `src-tauri/src/main.rs`:
   ```rust
   .invoke_handler(tauri::generate_handler![
       // ... other commands
       commands::my_module::my_new_command,
   ])
   ```

3. Call it from frontend:
   ```typescript
   import { invoke } from '@tauri-apps/api/core';
   const result = await invoke<string>('my_new_command');
   ```

---

## Next Steps

1. **Run the app in development mode:**
   ```bash
   npm run tauri:dev
   ```

2. **Explore the UI:**
   - Add a new server
   - Toggle servers on/off
   - Export configuration to Claude Desktop
   - Change settings

3. **Check the code:**
   - Look at `src/components/features/servers/ServerList.tsx` to see how the UI is built
   - Look at `src-tauri/src/commands/servers.rs` to see how the backend handles requests
   - Look at `src/stores/serverStore.ts` to see how state is managed

4. **Make changes:**
   - Try changing the app name in `src-tauri/tauri.conf.json`
   - Try adding a new field to the Server form
   - Try changing the theme colors in `tailwind.config.js`

---

## Additional Resources

- **Tauri Documentation:** https://tauri.app/
- **React Documentation:** https://react.dev/
- **Rust Book:** https://doc.rust-lang.org/book/
- **Zustand Documentation:** https://zustand-demo.pmnd.rs/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search for error messages online (StackOverflow, GitHub Issues)
3. Check the Tauri Discord: https://discord.com/invite/tauri

---

**You're now ready to run Relay!** 🚀

Start with: `npm run tauri:dev`
