use tauri::State;
use crate::state::AppState;
use crate::models::server::Server;
use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use serde_json::{json, Value};

#[tauri::command]
pub async fn list_server_tools(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<Value, String> {
    let db = state.db.lock().await;
    
    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&server_id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
    let envs: std::collections::HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();

    let mut command_builder = if cfg!(windows) {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(&server.command);
        cmd
    } else {
        Command::new(&server.command)
    };

    let mut child = command_builder
        .args(args)
        .envs(envs)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn server: {}", e))?;

    let mut stdin = child.stdin.take().ok_or("Failed to open stdin")?;
    let stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let mut reader = BufReader::new(stdout).lines();

    // 1. Initialize
    let init_request = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "Relay-Inspector",
                "version": "1.0.0"
            }
        }
    });

    stdin.write_all(format!("{}\n", init_request).as_bytes()).await.map_err(|e| e.to_string())?;

    // Wait for init response
    let _init_response = reader.next_line().await.map_err(|e| e.to_string())?
        .ok_or("Server closed connection during initialization")?;

    // 2. Sent initialized notification (some servers might require it, though standard says it's optional)
    let initialized_notification = json!({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    });
    stdin.write_all(format!("{}\n", initialized_notification).as_bytes()).await.map_err(|e| e.to_string())?;

    // 3. List Tools
    let list_tools_request = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    });

    stdin.write_all(format!("{}\n", list_tools_request).as_bytes()).await.map_err(|e| e.to_string())?;

    let list_tools_response = reader.next_line().await.map_err(|e| e.to_string())?
        .ok_or("Server closed connection during tools/list")?;

    // Cleanup: Kill the process for now (Milestone 1 is a "one-off" inspection)
    let _ = child.kill().await;

    let response_json: Value = serde_json::from_str(&list_tools_response).map_err(|e| e.to_string())?;
    
    // Extract tools from the response result
    Ok(response_json.get("result").cloned().unwrap_or(json!({"tools": []})))
}

#[tauri::command]
pub async fn call_server_tool(
    state: State<'_, AppState>,
    server_id: String,
    tool_name: String,
    arguments: Value,
) -> Result<Value, String> {
    let db = state.db.lock().await;
    
    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&server_id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
    let envs: std::collections::HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();

    let mut command_builder = if cfg!(windows) {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(&server.command);
        cmd
    } else {
        Command::new(&server.command)
    };

    let mut child = command_builder
        .args(args)
        .envs(envs)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn server: {}", e))?;

    let mut stdin = child.stdin.take().ok_or("Failed to open stdin")?;
    let stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let mut reader = BufReader::new(stdout).lines();

    // 1. Initialize
    let init_request = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "Relay-Inspector",
                "version": "1.0.0"
            }
        }
    });
    stdin.write_all(format!("{}\n", init_request).as_bytes()).await.map_err(|e| e.to_string())?;
    let _ = reader.next_line().await.map_err(|e| e.to_string())?;

    // 2. Call Tool
    let call_tool_request = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    });

    stdin.write_all(format!("{}\n", call_tool_request).as_bytes()).await.map_err(|e| e.to_string())?;

    let call_tool_response = reader.next_line().await.map_err(|e| e.to_string())?
        .ok_or("Server closed connection during tools/call")?;

    let _ = child.kill().await;

    let response_json: Value = serde_json::from_str(&call_tool_response).map_err(|e| e.to_string())?;
    Ok(response_json.get("result").cloned().unwrap_or(json!({"content": []})))
}
