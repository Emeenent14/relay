# Relay - Quick Start Guide

Get Relay up and running in 5 minutes!

## ⚡ Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js v18 or higher (`node --version`)
- [ ] Rust installed (`rustc --version`)
- [ ] Platform-specific tools installed (see below)

### Windows
- [ ] Visual Studio C++ Build Tools installed

### macOS
- [ ] Xcode Command Line Tools installed (`xcode-select --install`)

### Linux (Ubuntu/Debian)
- [ ] Required packages: `libwebkit2gtk-4.0-dev build-essential`

**Don't have these?** See [SETUP.md](./SETUP.md) for detailed installation instructions.

---

## 🚀 Quick Setup

### 1. Open Terminal in Project Directory
```bash
cd C:\Users\User\Documents\Relay
```

### 2. Install Dependencies
```bash
npm install
```
⏱️ This takes 1-2 minutes

### 3. Start the Application
```bash
npm run tauri:dev
```
⏱️ First time: 5-10 minutes (compiles Rust dependencies)
⏱️ Subsequent runs: 30-60 seconds

### 4. Wait for the Window to Open
A desktop window will automatically open with the Relay application.

---

## 🎯 First Use

Once the application opens:

### Add Your First Server
1. Click **"Add Server"** button
2. Fill in the form:
   - **Name:** My First Server
   - **Command:** node
   - **Category:** AI
   - **Description:** (optional)
3. Click **"Add Server"**

### Enable the Server
- Toggle the switch on the server card to enable it

### Export to Claude Desktop
1. Click **"Export to Claude"** button
2. Configuration is automatically written to Claude Desktop's config file

### Change Settings
1. Click **"Settings"** in the sidebar
2. Choose your theme (Light/Dark/System)
3. Toggle auto-export if desired

---

## 📁 Where is My Data?

Your data is stored locally:

**Windows:**
```
C:\Users\<your-username>\AppData\Local\com.relay.app\data.db
```

**macOS:**
```
~/Library/Application Support/com.relay.app/data.db
```

**Linux:**
```
~/.local/share/com.relay.app/data.db
```

---

## 🛑 Stopping the Application

### In Development Mode
- Press `Ctrl+C` in the terminal
- Or close the application window

### In Production
- Close the application window normally

---

## 🔧 Common First-Time Issues

### "Command not found: cargo"
**Fix:** Rust is not installed or not in PATH
- Install from: https://rustup.rs/
- Restart terminal after installation

### "Command not found: node"
**Fix:** Node.js is not installed
- Install from: https://nodejs.org/

### Build Takes Forever
**This is normal!** First Rust compilation takes 5-10 minutes.
- Grab a coffee ☕
- Subsequent builds are much faster

### "Failed to initialize database"
**Fix:** Permission issue
- Ensure you have write access to your user directory
- On Windows, run terminal as administrator if needed

---

## 📖 Need More Help?

- **Installation Issues:** See [SETUP.md](./SETUP.md)
- **Development Tasks:** See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Architecture Info:** See [README.md](./README.md)
- **Complete Overview:** See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## ✅ Success Checklist

You're ready to use Relay when:
- [x] Application window opens without errors
- [x] You can add a server
- [x] You can enable/disable servers
- [x] Export to Claude Desktop works
- [x] Settings can be changed and persist

---

## 🎉 You're All Set!

Relay is now running. Start managing your MCP servers!

**Next Steps:**
1. Add all your MCP servers
2. Organize them by category
3. Export configuration to Claude Desktop
4. Enjoy seamless AI tool management

---

**Having Issues?**
Check the troubleshooting section in [SETUP.md](./SETUP.md) or review error messages in the terminal for specific guidance.
