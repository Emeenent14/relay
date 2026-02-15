use crate::models::server::Server;
use crate::proxy::{record_traffic, TrafficDirection};
use crate::state::AppState;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::process::Stdio;
use tauri::{AppHandle, State};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdin, ChildStdout, Command};
use tokio::time::{timeout, Duration};

async fn send_json_message(
    stdin: &mut ChildStdin,
    state: &AppState,
    app: &AppHandle,
    server_id: &str,
    payload: Value,
) -> Result<(), String> {
    let line = payload.to_string();
    record_traffic(state, app, server_id, TrafficDirection::Outbound, &line).await;
    stdin
        .write_all(format!("{}\n", line).as_bytes())
        .await
        .map_err(|e| e.to_string())
}

/// Read a valid JSON-RPC response, skipping non-JSON startup lines.
async fn read_json_response(
    reader: &mut Lines<BufReader<ChildStdout>>,
    timeout_secs: u64,
    context: &str,
    state: &AppState,
    app: &AppHandle,
    server_id: &str,
) -> Result<Value, String> {
    let deadline = Duration::from_secs(timeout_secs);

    for _attempt in 0..20 {
        let line_result = timeout(deadline, reader.next_line()).await;

        match line_result {
            Ok(Ok(Some(line))) => {
                if line.trim().is_empty() {
                    continue;
                }

                record_traffic(state, app, server_id, TrafficDirection::Inbound, &line).await;

                if let Ok(json_value) = serde_json::from_str::<Value>(&line) {
                    if json_value.get("jsonrpc").is_some() {
                        return Ok(json_value);
                    }
                }
            }
            Ok(Ok(None)) => {
                return Err(format!("Server closed connection during {}", context));
            }
            Ok(Err(e)) => {
                return Err(format!("IO error during {}: {}", context, e));
            }
            Err(_) => {
                return Err(format!(
                    "Timeout waiting for response during {} (waited {}s)",
                    context, timeout_secs
                ));
            }
        }
    }

    Err(format!(
        "Failed to get valid JSON-RPC response after 20 attempts during {}",
        context
    ))
}

fn build_command(command: &str) -> Command {
    #[cfg(windows)]
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    if cfg!(windows) {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(command);
        #[cfg(windows)]
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd
    } else {
        Command::new(command)
    }
}

#[tauri::command]
pub async fn list_server_tools(
    state: State<'_, AppState>,
    app: AppHandle,
    server_id: String,
) -> Result<Value, String> {
    let db = state.db.lock().await;

    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&server_id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
    let envs: HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();

    let mut command_builder = build_command(&server.command);
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

    send_json_message(&mut stdin, &state, &app, &server_id, init_request).await?;
    let _ = read_json_response(
        &mut reader,
        15,
        "initialization",
        &state,
        &app,
        &server_id,
    )
    .await?;

    let initialized_notification = json!({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    });
    send_json_message(
        &mut stdin,
        &state,
        &app,
        &server_id,
        initialized_notification,
    )
    .await?;

    let list_tools_request = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    });
    send_json_message(&mut stdin, &state, &app, &server_id, list_tools_request).await?;

    let response_json =
        read_json_response(&mut reader, 10, "tools/list", &state, &app, &server_id).await?;
    let _ = child.kill().await;

    Ok(response_json
        .get("result")
        .cloned()
        .unwrap_or(json!({ "tools": [] })))
}

#[tauri::command]
pub async fn call_server_tool(
    state: State<'_, AppState>,
    app: AppHandle,
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
    let envs: HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();

    let mut command_builder = build_command(&server.command);
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

    send_json_message(&mut stdin, &state, &app, &server_id, init_request).await?;
    let _ = read_json_response(
        &mut reader,
        15,
        "initialization",
        &state,
        &app,
        &server_id,
    )
    .await?;

    let initialized_notification = json!({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    });
    send_json_message(
        &mut stdin,
        &state,
        &app,
        &server_id,
        initialized_notification,
    )
    .await?;

    let call_tool_request = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    });
    send_json_message(&mut stdin, &state, &app, &server_id, call_tool_request).await?;

    let response_json =
        read_json_response(&mut reader, 30, "tools/call", &state, &app, &server_id).await?;
    let _ = child.kill().await;

    Ok(response_json
        .get("result")
        .cloned()
        .unwrap_or(json!({ "content": [] })))
}
