use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tauri::{AppHandle, Emitter};
use crate::state::ServerProcess;

use crate::utils::secrets::SecretManager;

pub async fn spawn_server(
    id: String,
    name: String,
    command: String,
    args: Vec<String>,
    mut envs: std::collections::HashMap<String, String>,
    secrets: Vec<String>,
    app: AppHandle,
) -> Result<ServerProcess, String> {
    // Inject secrets from keyring
    for key in secrets {
        if let Ok(value) = SecretManager::get_secret(&id, &key) {
            envs.insert(key, value);
        }
    }

    #[cfg(windows)]
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let mut command_builder = if cfg!(windows) {
        let mut cmd = Command::new("cmd");
        cmd.arg("/C").arg(&command);
        #[cfg(windows)]
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd
    } else {
        Command::new(&command)
    };

    let mut child = command_builder
        .args(args)
        .envs(envs)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn server: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;
    
    let app_clone = app.clone();
    let id_clone = id.clone();
    let name_clone = name.clone();

    // Stream stdout logs
    tokio::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone.emit("server-log", json!({
                "id": id_clone,
                "name": name_clone,
                "stream": "stdout",
                "message": line,
                "timestamp": chrono::Utc::now().to_rfc3339()
            }));
        }
    });

    let app_clone2 = app.clone();
    let id_clone2 = id.clone();
    let name_clone2 = name.clone();

    // Stream stderr logs
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone2.emit("server-log", json!({
                "id": id_clone2,
                "name": name_clone2,
                "stream": "stderr",
                "message": line,
                "timestamp": chrono::Utc::now().to_rfc3339()
            }));
        }
    });

    Ok(ServerProcess {
        child,
    })
}

use serde_json::json;
