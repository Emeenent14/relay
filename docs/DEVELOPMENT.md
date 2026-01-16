# Development Guide

Quick reference for developing Relay.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## 📁 Key Files and Directories

### Frontend (React + TypeScript)
```
src/
├── components/          # UI components
│   ├── ui/             # Base shadcn/ui components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── stores/             # Zustand state stores
├── lib/                # Utilities
│   ├── tauri.ts       # Tauri API wrappers
│   └── utils.ts       # Helper functions
└── types/              # TypeScript types
```

### Backend (Rust + Tauri)
```
src-tauri/src/
├── commands/           # Tauri commands (API endpoints)
│   ├── servers.rs     # Server CRUD
│   ├── config.rs      # Config export
│   └── settings.rs    # Settings management
├── models/            # Data models
├── utils/             # Utilities
├── db.rs             # Database setup
├── state.rs          # App state
└── main.rs           # Entry point
```

## 🔧 Common Tasks

### Adding a New Tauri Command

1. **Create the command in Rust:**

```rust
// src-tauri/src/commands/my_commands.rs
use tauri::State;
use crate::state::AppState;

#[tauri::command]
pub async fn my_command(
    state: State<'_, AppState>,
    param: String,
) -> Result<String, String> {
    // Your logic here
    Ok(format!("Received: {}", param))
}
```

2. **Register the command:**

```rust
// src-tauri/src/main.rs
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::my_commands::my_command,
])
```

3. **Call from frontend:**

```typescript
// src/lib/tauri.ts or component file
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<string>('my_command', { param: 'test' });
```

### Adding a New UI Component

1. **Create the component:**

```typescript
// src/components/features/my-feature/MyComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MyComponent() {
    const [state, setState] = useState('');

    return (
        <div>
            <Button onClick={() => setState('clicked')}>
                Click me
            </Button>
        </div>
    );
}
```

2. **Use it in your app:**

```typescript
// src/App.tsx or other component
import { MyComponent } from '@/components/features/my-feature/MyComponent';

function App() {
    return <MyComponent />;
}
```

### Adding a Database Migration

1. **Create migration file:**

```sql
-- src-tauri/migrations/002_add_new_field.sql
ALTER TABLE servers ADD COLUMN new_field TEXT;
```

2. **Migrations run automatically** when the app starts.

### Updating the Database Schema

1. **Update migration SQL**
2. **Update Rust model:**

```rust
// src-tauri/src/models/server.rs
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Server {
    // ... existing fields
    pub new_field: Option<String>,
}
```

3. **Update TypeScript type:**

```typescript
// src/types/server.ts
export interface Server {
    // ... existing fields
    newField?: string;
}
```

### Adding a New Store

1. **Create store file:**

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
    data: string;
    setData: (data: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
    data: '',
    setData: (data) => set({ data }),
}));
```

2. **Use in components:**

```typescript
import { useMyStore } from '@/stores/myStore';

function MyComponent() {
    const { data, setData } = useMyStore();
    return <div onClick={() => setData('new value')}>{data}</div>;
}
```

## 🎨 Styling Guide

### Using Tailwind CSS

```typescript
// Basic styling
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
    <span className="text-lg font-bold">Hello</span>
</div>

// Responsive styling
<div className="w-full md:w-1/2 lg:w-1/3">
    Content
</div>

// Dark mode
<div className="bg-white dark:bg-gray-800">
    Content
</div>
```

### Using shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

<Card>
    <Input placeholder="Enter text" />
    <Button variant="default">Submit</Button>
</Card>
```

### Component Variants

```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

## 🔍 Debugging

### Frontend Debugging

```typescript
// Console logging
console.log('Debug:', data);

// Use React DevTools (Chrome extension)
// Inspect components, props, and state
```

### Backend Debugging

```rust
// Print to terminal
println!("Debug: {:?}", variable);

// Use dbg! macro
dbg!(&variable);

// Log errors
eprintln!("Error: {}", error);
```

### Database Debugging

```typescript
// Check database location (in dev mode)
// Windows: C:\Users\<user>\AppData\Local\com.relay.app\data.db
// macOS: ~/Library/Application Support/com.relay.app/data.db
// Linux: ~/.local/share/com.relay.app/data.db

// Use SQLite browser to inspect:
// https://sqlitebrowser.org/
```

## 🧪 Testing

### Frontend Testing (Manual)

1. Run dev mode: `npm run tauri:dev`
2. Test each feature:
   - Add/edit/delete servers
   - Toggle servers on/off
   - Export configuration
   - Change settings
   - Switch themes

### Backend Testing

```rust
// Add tests to command files
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_my_command() {
        // Test logic
        assert_eq!(1 + 1, 2);
    }
}

// Run tests
// cargo test --manifest-path=src-tauri/Cargo.toml
```

## 📦 Building and Distribution

### Development Build
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run tauri:build
```

### Build Output Locations

**Windows:**
- `src-tauri/target/release/relay.exe`
- `src-tauri/target/release/bundle/msi/relay_0.1.0_x64_en-US.msi`

**macOS:**
- `src-tauri/target/release/relay`
- `src-tauri/target/release/bundle/dmg/Relay_0.1.0_x64.dmg`

**Linux:**
- `src-tauri/target/release/relay`
- `src-tauri/target/release/bundle/deb/relay_0.1.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/relay_0.1.0_amd64.AppImage`

## 🔧 Configuration

### Tauri Configuration
Edit `src-tauri/tauri.conf.json`:

```json
{
  "package": {
    "productName": "Relay",
    "version": "0.1.0"
  },
  "tauri": {
    "windows": [{
      "title": "Relay - MCP Toolkit",
      "width": 1200,
      "height": 800
    }]
  }
}
```

### Vite Configuration
Edit `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 1420,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 📝 Code Style

### TypeScript
- Use functional components
- Prefer `const` over `let`
- Use TypeScript types, avoid `any`
- Use async/await over promises

```typescript
// Good
const getData = async (): Promise<Data[]> => {
    return await invoke<Data[]>('get_data');
};

// Avoid
function getData() {
    return invoke('get_data');
}
```

### Rust
- Use `async/await` for database operations
- Return `Result<T, String>` from commands
- Use descriptive error messages

```rust
// Good
#[tauri::command]
pub async fn get_data(state: State<'_, AppState>) -> Result<Vec<Data>, String> {
    let db = state.db.lock().await;
    sqlx::query_as("SELECT * FROM data")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))
}
```

## 🐛 Common Issues

### Issue: Changes not reflecting
- **Frontend changes:** Should auto-reload
- **Backend changes:** Restart dev server

### Issue: TypeScript errors
```bash
# Check for type errors
npx tsc --noEmit
```

### Issue: Rust compilation errors
```bash
# Check Rust code
cd src-tauri
cargo check
```

### Issue: Database locked
- Close all app instances
- Delete database file and restart (dev only)

## 📚 Resources

- [Tauri Docs](https://tauri.app/)
- [React Docs](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🎯 Project Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                     User Interface                   │
│                  (React Components)                  │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ invoke()
                      ▼
┌─────────────────────────────────────────────────────┐
│                  State Management                    │
│                   (Zustand Stores)                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Tauri API
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Tauri IPC Layer                      │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Command Handlers
                      ▼
┌─────────────────────────────────────────────────────┐
│                  Rust Backend                        │
│              (Commands + Database)                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ SQLite
                      ▼
┌─────────────────────────────────────────────────────┐
│              Local Database File                     │
│          (~/.local/share/relay/data.db)             │
└─────────────────────────────────────────────────────┘
```

---

Happy coding! 🚀
