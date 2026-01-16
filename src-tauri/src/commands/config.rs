use tauri::State;
use crate::state::AppState;
use crate::models::server::Server;
use crate::utils::paths::get_claude_config_path;
use std::collections::HashMap;
use serde_json::{json, Value};

#[tauri::command]
pub async fn get_claude_config_path() -> Result<String, String> {
    get_claude_config_path()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine Claude config path".to_string())
}

#[tauri::command]
pub async fn export_to_claude(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().await;

    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE enabled = 1")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let config_path = get_claude_config_path()
        .ok_or_else(|| "Could not determine Claude config path".to_string())?;

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

    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(config_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn export_config(
    state: State<'_, AppState>,
    client_id: String,
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
