use tauri::State;
use crate::state::AppState;
use crate::models::server::Server;
use crate::utils::paths::get_claude_config_path;
use std::collections::HashMap;
use serde_json::{json, Value};

#[tauri::command]
pub async fn get_config_path() -> Result<String, String> {
    get_claude_config_path()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine Claude config path".to_string())
}

use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn export_to_claude(app: AppHandle, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().await;

    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE enabled = 1")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    // Prepare proper args and env for each server
    let mut relay_servers = Vec::new();
    for server in servers {
        let args: Vec<String> = serde_json::from_str(&server.args)
            .unwrap_or_default();
        let env: HashMap<String, String> = serde_json::from_str(&server.env)
            .unwrap_or_default();

        let mut server_json = json!({
            "id": server.id,
            "name": server.name,
            "command": server.command,
            "args": args,
        });

        if !env.is_empty() {
            server_json["env"] = json!(env);
        }
        
        relay_servers.push(server_json);
    }

    let relay_config = json!({
        "servers": relay_servers
    });

    // 1. Write relay.json to AppData
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    }
    
    let relay_config_path = app_data_dir.join("relay.json");
    
    std::fs::write(&relay_config_path, serde_json::to_string_pretty(&relay_config).unwrap())
        .map_err(|e| format!("Failed to write relay config: {}", e))?;

    // 2. Determine Gateway Script Path (dist/gateway.js)
    // In actual prod, we might need to copy this file to app_data_dir or find it in resources.
    // For now, we point to the absolute path in the project dist folder.
    let cwd = std::env::current_dir().unwrap(); // Likely src-tauri
    
    // Check cwd/dist/gateway.js
    let mut gateway_script_path = cwd.join("dist").join("gateway.js");

    // If not found, check parent (cwd/../dist/gateway.js)
    if !gateway_script_path.exists() {
        if let Some(parent) = cwd.parent() {
            let parent_path = parent.join("dist").join("gateway.js");
            if parent_path.exists() {
                gateway_script_path = parent_path;
            }
        }
    }

    if !gateway_script_path.exists() {
        return Err(format!("Gateway script not found at {}. Please run 'npm run build:gateway'.", gateway_script_path.display()));
    }

    // 3. Write Claude Config with Single Gateway Entry
    let config_path = get_claude_config_path()
        .ok_or_else(|| "Could not determine Claude config path".to_string())?;

    let claude_config = json!({
        "mcpServers": {
            "Relay Gateway": {
                "command": "node",
                "args": [
                    gateway_script_path.to_string_lossy(),
                ],
                "env": {
                    "RELAY_CONFIG_PATH": relay_config_path.to_string_lossy()
                }
            }
        }
    });

    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&claude_config).unwrap())
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(config_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn export_config(
    state: State<'_, AppState>,
    _client_id: String,
) -> Result<String, String> {
    let db = state.db.lock().await;

    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE enabled = 1")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let mut mcp_servers = HashMap::new();

    for server in servers {
        let args: Vec<String> = serde_json::from_str(&server.args)
            .unwrap_or_default();
        let env: HashMap<String, String> = serde_json::from_str(&server.env)
            .unwrap_or_default();

        let mut server_config = json!({
            "command": server.command,
            "args": args,
        });

        if !env.is_empty() {
            server_config["env"] = json!(env);
        }

        mcp_servers.insert(server.name.clone(), server_config);
    }

    let config = json!({
        "mcpServers": mcp_servers
    });

    Ok(serde_json::to_string_pretty(&config).unwrap())
}

#[tauri::command]
pub async fn read_claude_config() -> Result<Value, String> {
    let config_path = get_claude_config_path()
        .ok_or_else(|| "Could not determine Claude config path".to_string())?;

    if !config_path.exists() {
        return Ok(json!({ "mcpServers": {} }));
    }

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))
}

#[tauri::command]
pub fn expand_path(path: String) -> Result<String, String> {

    let expanded = if path.starts_with("~") {
        // Expand tilde to home directory
        if let Some(home) = dirs::home_dir() {
            path.replacen("~", &home.to_string_lossy(), 1)
        } else {
            return Err("Could not determine home directory".to_string());
        }
    } else if cfg!(windows) && (path.contains("%APPDATA%") || path.contains("%USERPROFILE%")) {
        // Expand Windows environment variables
        let mut expanded = path.clone();

        if let Some(appdata) = std::env::var("APPDATA").ok() {
            expanded = expanded.replace("%APPDATA%", &appdata);
        }
        if let Some(userprofile) = std::env::var("USERPROFILE").ok() {
            expanded = expanded.replace("%USERPROFILE%", &userprofile);
        }

        expanded
    } else if !cfg!(windows) && path.contains("$HOME") {
        // Expand $HOME on Unix systems
        if let Some(home) = dirs::home_dir() {
            path.replace("$HOME", &home.to_string_lossy())
        } else {
            return Err("Could not determine home directory".to_string());
        }
    } else {
        path
    };

    Ok(expanded)
}
