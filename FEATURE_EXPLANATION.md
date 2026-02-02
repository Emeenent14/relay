# Relay Feature Explanation: Milestones 1, 2, & 3

This document provides a detailed breakdown of the features implemented in the first three milestones of Phase 1, covering both the user experience and the technical "under the hood" logic.

---

## 🔍 Milestone 1: MCP Inspector / Playground

### User Experience
The **Inspector** is a developer's playground. It allows you to:
1.  **Select a Server**: Choose any of your configured servers from a dropdown.
2.  **Handshake**: Click "Connect & Inspect". Behind the scenes, Relay starts the server and initiates a connection.
3.  **Explore Capabilities**: Once connected, you see a list of every "Tool" that the server provides (e.g., `read_file`, `search_repositories`).
4.  **Test Tools**: Click on a tool, enter arguments in a JSON editor, and click "Run Tool". You immediately see the result returned by the server.

### Under the Hood
*   **Process Spawning**: When you click "Connect", the Rust backend spawns the server as a child process using `tokio::process::Command`. On Windows, it uses `cmd /C` to ensure compatibility with scripts like `npx`.
*   **JSON-RPC Handshake**: Relay implements the **Model Context Protocol (MCP)**. It sends an `initialize` request to the server's `stdin` and waits for an `initialized` response on `stdout`.
*   **Message Passing**:
    *   **Listing Tools**: Sends a `tools/list` request.
    *   **Calling Tools**: Sends a `tools/call` request with the user-provided JSON arguments.
*   **Frontend Bridge**: The React frontend communicates with Rust via Tauri's `invoke` system.

---

## 💓 Milestone 2: Server Health Monitoring & Logs

### User Experience
This milestone transforms Relay from a static configuration tool into a live server manager.
1.  **Status Indicators**: In your server list, each server now has a colored dot:
    *   🟢 **Green**: The server is currently running and healthy.
    *   🟡 **Yellow**: The server is enabled but hasn't started or is initializing.
    *   ⚪ **Gray**: The server is disabled.
2.  **Live Logs**: Click the **Terminal (Logs)** icon on any server. A dialog opens showing real-time `stdout` and `stderr` output. This is invaluable for debugging connection issues or seeing what the server is doing in the background.

### Under the Hood
*   **AppState & ProcessManager**: The Rust backend maintains a global `AppState` containing a `ProcessManager`. This manager holds a thread-safe map of all active server processes.
*   **Lifetime Management**: When you toggle a server "On", the backend spawns a long-running process. If you toggle it "Off" or close the app, the backend gracefully terminates the process.
*   **Log Streaming via Piped IO**:
    *   The child process's `stdout` and `stderr` are piped.
    *   A background async task reads these pipes line-by-line using `BufReader`.
    *   Every line is wrapped in a `server-log` event and emitted to the frontend via `window.emit()`.
*   **Frontend Store**: The `serverStore.ts` (Zustand) listens for these events and maintains a rolling buffer (last 1000 lines) for each server, which the `ServerLogsDialog` then renders.

---

## 🛒 Milestone 3: Dynamic Marketplace

### User Experience
The **Marketplace** makes discovering new MCP servers effortless.
1.  **Browse & Search**: Access a gallery of community-built servers for GitHub, PostgreSQL, Slack, Google Drive, and more.
2.  **One-Click Install**: Click the "Install" button. Instead of typing complex commands manually, Relay opens the "Add Server" dialog with all fields (Name, Command, Arguments, Category) already pre-filled.
3.  **Discovery**: Easily find specialized tools categorized by use-case (e.g., "Database", "Development").

### Under the Hood
*   **Marketplace Service**: A dedicated TypeScript service (`marketplace.ts`) handles fetching metadata. Currently, it uses a curated list and is architected to pull from the official MCP registry on GitHub.
*   **Aggregation Engine**: It parses structured JSON from registries and maps them to Relay's internal `Server` model.
*   **Pre-fill Mechanism**: 
    *   The `uiStore` was updated to hold temporary `marketplaceData`.
    *   When "Install" is clicked, this data is saved to the store, and the "Add" dialog is opened.
    *   The `AddServerDialog` uses a `useEffect` hook to detect this data and automatically populate its form state, allowing the user to simply review and click "Save".

---

## 🔒 Milestone 4: Secure Secret Management

### User Experience
Relay now handles sensitive data (API keys, tokens) with industry-standard security.
1.  **Secure Fields**: When adding or editing a server, you can toggle the **Lock** icon on any environment variable to mark it as a "Secure Secret".
2.  **Keyring Storage**: Once marked as secure, the value is **never** stored in the local SQLite database. It is sent directly to your system's native secure storage (e.g., Windows Credential Manager).
3.  **Masked UI**: In the Edit dialog, secret values are masked (`********`). You can overwrite them, but you can never "reveal" an existing secret once it's saved, ensuring your keys stay private.
4.  **Automatic Injection**: When a server starts, Relay securely retrieves the secret from the keyring and injects it directly into the process environment.

### Under the Hood
*   **Keyring-RS Integration**: Relay uses the `keyring` crate to interface with the operating system's credential store. On Windows, this is the **Windows Credential Manager**.
*   **Zero-Persistence in DB**: The `servers` table only stores the *keys* of the secrets in a JSON array. The values stay outside the application's local files.
*   **Runtime Fetching**: Inside `utils/process.rs`, the `spawn_server` function iterates through the secret keys, fetches the passwords from the keyring using the server's unique ID as the service name, and merges them into the environment variables map before spawning the child process.
*   **Cleanup**: When a server is deleted, Relay automatically purges all associated secrets from the system keyring to prevent data rot.

---

## Technical Stack Summary
*   **Frontend**: React, Tailwind CSS (Vanilla), Lucide Icons, Zustand (State), shadcn/ui.
*   **Backend**: Rust, Tauri, Tokio (Async/Process), SQLx (Database).
*   **Protocol**: JSON-RPC 2.0 (MCP standard).
