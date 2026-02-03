use tauri::State;
use crate::state::AppState;
use crate::models::server::Server;
use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::ChildStdout;
use tokio::time::{timeout, Duration};
use serde_json::{json, Value};

/// Helper function to read a valid JSON-RPC response, skipping any non-JSON startup messages
async fn read_json_response(
    reader: &mut Lines<BufReader<ChildStdout>>,
    timeout_secs: u64,
    context: &str,
) -> Result<Value, String> {
    let deadline = Duration::from_secs(timeout_secs);
    
    // Try to read lines until we get a valid JSON-RPC response
    for _attempt in 0..20 {
        let line_result = timeout(deadline, reader.next_line()).await;
        
        match line_result {
            Ok(Ok(Some(line))) => {
                // Skip empty lines
                if line.trim().is_empty() {
                    continue;
                }
                
                // Try to parse as JSON
                if let Ok(json_value) = serde_json::from_str::<Value>(&line) {
                    // Check if it looks like a JSON-RPC response (has "jsonrpc" field)
                    if json_value.get("jsonrpc").is_some() {
                        return Ok(json_value);
                    }
                }
                // If not valid JSON-RPC, it's probably a startup message - skip it
            }
            Ok(Ok(None)) => {
                return Err(format!("Server closed connection during {}", context));
            }
            Ok(Err(e)) => {
                return Err(format!("IO error during {}: {}", context, e));
            }
            Err(_) => {
                return Err(format!("Timeout waiting for response during {} (waited {}s)", context, timeout_secs));
            }
        }
    }
    
    Err(format!("Failed to get valid JSON-RPC response after 20 attempts during {}", context))
}

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

    // Wait for init response (with timeout and non-JSON line skipping)
    let _init_response = read_json_response(&mut reader, 15, "initialization").await?;

    // 2. Send initialized notification
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

    let response_json = read_json_response(&mut reader, 10, "tools/list").await?;

    // Cleanup: Kill the process
    let _ = child.kill().await;
    
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
    let _ = read_json_response(&mut reader, 15, "initialization").await?;

    // 2. Send initialized notification
    let initialized_notification = json!({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    });
    stdin.write_all(format!("{}\n", initialized_notification).as_bytes()).await.map_err(|e| e.to_string())?;

    // 3. Call Tool
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

    let response_json = read_json_response(&mut reader, 30, "tools/call").await?;

    let _ = child.kill().await;

    Ok(response_json.get("result").cloned().unwrap_or(json!({"content": []})))
}
