# Relay Project Roadmap

To make Relay the best MCP manager on the market, we are transforming it from a "config editor" into a powerful **development & debugging hub**.

## 🚀 Phase 1: Killer Features (High Impact)
*Goal: Developer Toolkit & Ecosystem*

- [ ] **Built-in MCP Inspector / Playground**
    - Connect to servers directly within Relay.
    - Manually invoke tools and view JSON responses.
    - Test prompts and resources without opening Claude.
- [ ] **Server Health Monitoring & Logs**
    - Real-time status indicators (Green/Red dot).
    - Live `stdout`/`stderr` log streaming for debugging crashes.
- [ ] **Dynamic Marketplace / Community Hub**
    - Fetch server list from remote community sources.
    - Always up-to-date catalog without app updates.
- [ ] **Secure Secret Management**
    - Store API keys in Windows/macOS Keychain instead of plain text.

## 🛠️ Phase 2: Usability Improvements
*Goal: Frictionless Experience*

- [ ] **Multi-Profile Support**
    - Switch between "Work" (Jira, GitHub) and "Personal" (Spotify) profiles.
- [ ] **Smart Dependency Checks**
    - Auto-detect if `docker`, `npm`, or `python` is missing before installing servers.
- [ ] **Auto-Update for Servers**
    - One-click update for NPM and Git-based servers.
- [ ] **Import from Existing Config**
    - Auto-import servers from Claude Desktop config on first launch.

## ✨ Phase 3: Polish & "Wow" Factors
*Goal: Premium Feel*

- [ ] **System Tray & Global Hotkeys**
    - Toggle servers via `Ctrl+Shift+M` without opening the window.
- [ ] **Visual Relationship Graph**
    - Node graph visualization of servers and their tools.
- [ ] **Remote Server Support (SSE)**
    - Support for enterprise MCP servers running over HTTP/SSE.

## 🛡️ Phase 4: Enterprise Features
*Goal: Power User Controls*

- [ ] **Conflict Detection**
    - Warning when multiple servers provide the same tool name.
- [ ] **Environment Variable Injection**
    - Inherit host shell environment variables safely.
