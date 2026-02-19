# Master Implementation Roadmap

This comprehensive plan covers all remaining work required to meet the "MCP Toolkit" v1.0 vision, ranked by strict priority.

## ✅ Shipped (v0.1.x)

### Context Window Monitoring (The "Proxy")

**Status**: Shipped in v0.1.0

- Rust proxy in `src-tauri/src/proxy.rs` intercepts traffic for token/byte counting.
- "Context Usage" badges on `ServerCard.tsx`.

### Live Log Viewer & Debugging

**Status**: Shipped in v0.1.0

- Terminal icon in `ServerCard.tsx` opens `ServerLogsDialog`.
- Auto-scrolling, color-coded `stderr` (red) vs `stdout`.

### Cross-Platform Reliability (Export)

**Status**: Shipped in v0.1.0

- One-click export to Claude, Cursor, Windsurf, and custom clients.
- File picker for manually selecting config paths.

### Profiles & Grouping

**Status**: Shipped in v0.1.2

- `profiles` table in SQLite.
- Profile dropdown in sidebar to toggle sets of servers.

### Advanced Error Handling

**Status**: Shipped in v0.1.2

- "Test Connection" button with dependency checking and health checks.

### Marketplace & Server Discovery

**Status**: Shipped in v0.1.3

- Docker Hub and MCP Registry integration.
- Curated local catalog fallback.
- Trust indicators (Verified, Official, Community) and freshness metadata.

---

## 🚧 In Progress (v0.1.5)

### Conflict Detection

- Detect duplicate tool names across enabled servers.
- Warning banner on the server list page.

### Remote Server Support (HTTP/SSE)

- Add `transport` and `url` fields for SSE-based MCP servers.
- UI for selecting transport type during server creation.

### Environment Variable Injection Controls

- Advanced section in server config for editing env vars.
- Support for sensitive/masked values.

---

## 📋 Backlog (v2.0+)

### Cloud Sync

**Why**: Sync configs across laptop/desktop.

- Architecture: Requires integration with a backend (Supabase/Firebase) for user auth and data storage.

### Team Features

**Why**: Enterprise governance.

- RBAC: Role-based access control.
- Shared Configs: Team-wide server lists.

### Visual Relationship Graph

- D3.js-based visualization of server-tool-client connections.

### System Tray & Global Hotkey

- Minimize to system tray on close.
- Configurable global hotkey (default: `Ctrl+Shift+R`).
