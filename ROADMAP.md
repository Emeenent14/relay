# Master Implementation Roadmap

This comprehensive plan covers all remaining work required to meet the "MCP Toolkit" v1.0 vision, ranked by strict priority.

## User Review Required

> [!IMPORTANT]
> **Priority 1 (Critical)** items tackle the #1 and #2 top pain points: **Context Window Monitoring** and **Debugging/Logs**. These are the core differentiators against Docker.

## Priority 1: Critical Core Differentiators (v1.0 MVP)

### 1.1 Context Window Monitoring (The "Proxy")
**Why**: Addresses the #2 top pain point ("Context window is always full").
**Goal**: Intercept traffic to count tokens/bytes.
- **Implement Rust Proxy**: Create a lightweight TCP/Stdio proxy in `src-tauri/src/proxy.rs`.
- **Token Counting**: Simple byte-count estimation (or BPE if feasible) during message interception.
- **UI Badge**: Add "Context Usage" badge to `ServerCard.tsx`.

### 1.2 Live Log Viewer & Debugging
**Why**: Addresses "Generic error messages" & "What's running?" (Pain points #3, #6).
**Goal**: Expose the already-implemented log streams to the user.
- **[UI Fix] Enable Logs**: Add the missing "Terminal" icon button to `ServerCard.tsx` to open `ServerLogsDialog`.
- **Enhance Dialog**: Ensure `ServerLogsDialog` auto-scrolls and correctly color-codes `stderr` (Red) vs `stdout`.

### 1.3 Cross-Platform Reliability (Export)
**Why**: Addresses "Cross-platform inconsistency" (Pain point #5).
**Goal**: Ensure "One-click export" works for custom install paths.
- **Improved Dialog**: Update `ConnectCustomDialog.tsx` to include a file picker for manually selecting config paths (e.g., `settings.json`) if auto-detection fails.

## Priority 2: High Value / Quality of Life

### 2.1 Profiles & Grouping
**Why**: "Power Developers" need to switch contexts (e.g., "Coding", "Writing").
- **Database Schema**: Add `profiles` table to SQLite.
- **UI Selector**: Add a profile dropdown to the main header to toggle sets of servers.

### 2.2 Advanced Error Handling
**Why**: Users need to know *why* a connection failed.
- **Health Checks**: Implement a "Test Connection" button that dry-runs the command and captures the exit code/error message immediately.

## Priority 3: Future / Pro Features (v2.0)

### 3.1 Cloud Sync
**Why**: Sync configs across laptop/desktop.
- **Architecture**: Requires integration with a backend (Supabase/Firebase) for user auth and data storage.

### 3.2 Team Features
**Why**: Enterprise governance.
- **RBAC**: Role-based access control.
- **Shared Configs**: Team-wide server lists.
