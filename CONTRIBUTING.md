# Contributing to Relay

First off, thanks for taking the time to contribute! 🎉

Relay is built with **Tauri**, **React**, and **Rust**. We welcome contributions of all kinds, from bug fixes and documentation improvements to new features.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui.
*   **Backend**: Rust, Tauri v2.
*   **Database**: SQLite (via `sqlx`).

## 🚀 Setting Up Development Environment

### Prerequisites

1.  **Node.js** (v18 or later)
2.  **Rust** (latest stable) -> [Install Rust](https://www.rust-lang.org/tools/install)
3.  **System Dependencies**:
    *   **Windows**: Visual Studio C++ Build Tools.
    *   **macOS**: Xcode Command Line Tools.
    *   **Linux**: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`, `libsoup-3.0-dev`.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Emeenent14/Relay.git
    cd Relay
    ```

2.  **Install frontend dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    This will start both the React frontend and the Tauri Rust backend with hot-reloading.
    ```bash
    npm run tauri dev
    ```

### Building for Production

To build the executable for your current OS:

```bash
npm run tauri build
```

The output binary will be in `src-tauri/target/release/bundle/`.

## 📂 Project Structure

*   `src/`: React frontend code.
    *   `components/`: UI components.
    *   `stores/`: Zustand state management.
*   `src-tauri/`: Rust backend code.
    *   `src/commands/`: Tauri commands invoked by frontend.
    *   `src/models/`: Database models.

## 🤝 How to Contribute

1.  **Fork** the repository.
2.  Create a new **Branch** for your feature (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes.
4.  **Push** to the branch.
5.  Open a **Pull Request**.

## 🐛 Found a Bug?

If you find a bug in the source code or a mistake in the documentation, you can help us by [submitting an issue](https://github.com/Emeenent14/Relay/issues) to our GitHub Repository. Even better, you can submit a Pull Request with a fix.

## 💬 Community

Join us on [Discord](https://discord.gg/pjA3ag9H) to discuss ideas or ask for help!
