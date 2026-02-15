use crate::state::AppState;
use crate::utils::secrets::SecretManager;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::process::Stdio;
use std::sync::Arc;
use tauri::State;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{Child, ChildStdout, Command};
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyIssue {
    pub binary: String,
    pub required_by: String,
    pub install_hint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionTestResult {
    pub success: bool,
    pub message: String,
    pub exit_code: Option<i32>,
    pub missing_dependencies: Vec<DependencyIssue>,
    pub hints: Vec<String>,
    pub stderr_preview: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DependencyCheckInput {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TestConnectionInput {
    pub server_id: Option<String>,
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: HashMap<String, String>,
    #[serde(default)]
    pub secrets: Vec<String>,
}

fn extract_binary(command: &str) -> String {
    command
        .trim()
        .split_whitespace()
        .next()
        .unwrap_or("")
        .trim_matches('"')
        .trim_matches('\'')
        .to_string()
}

fn is_probably_path(binary: &str) -> bool {
    binary.contains('/') || binary.contains('\\') || binary.ends_with(".exe") || binary.ends_with(".cmd")
}

fn install_hint_for(binary: &str) -> String {
    let platform = if cfg!(windows) {
        "Windows"
    } else if cfg!(target_os = "macos") {
        "macOS"
    } else {
        "Linux"
    };

    match binary {
        "node" | "npm" | "npx" | "pnpm" | "yarn" | "bun" => format!(
            "{}: install Node.js LTS and ensure `node`/`npm` are on PATH.",
            platform
        ),
        "python" | "python3" | "pip" | "pip3" | "uv" | "pipx" => format!(
            "{}: install Python 3 and ensure `python` is on PATH. For `uv`, see docs.astral.sh/uv.",
            platform
        ),
        "docker" => format!(
            "{}: install Docker Desktop (or Docker Engine) and ensure `docker` is on PATH.",
            platform
        ),
        other => format!(
            "{}: install `{}` and make sure it is available on PATH.",
            platform, other
        ),
    }
}

async fn command_exists(binary: &str) -> bool {
    if binary.is_empty() {
        return false;
    }

    if is_probably_path(binary) {
        return std::path::Path::new(binary).exists();
    }

    #[cfg(windows)]
    {
        return Command::new("where")
            .arg(binary)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .await
            .map(|s| s.success())
            .unwrap_or(false);
    }

    #[cfg(not(windows))]
    {
        let cmd = format!("command -v '{}' >/dev/null 2>&1", binary.replace('\'', "'\"'\"'"));
        Command::new("sh")
            .arg("-c")
            .arg(cmd)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .await
            .map(|s| s.success())
            .unwrap_or(false)
    }
}

async fn collect_missing_dependencies(command: &str, args: &[String]) -> Vec<DependencyIssue> {
    let base = extract_binary(command);
    let mut required = HashSet::new();

    if !base.is_empty() {
        required.insert(base.clone());
    }

    if matches!(
        base.as_str(),
        "npx" | "npm" | "node" | "pnpm" | "yarn" | "bun"
    ) {
        required.insert("node".to_string());
    }

    if matches!(base.as_str(), "python" | "python3" | "pip" | "pip3" | "uv" | "pipx")
        || args.iter().any(|a| a.ends_with(".py"))
    {
        required.insert("python".to_string());
    }

    if base == "docker" || args.iter().any(|a| a.to_ascii_lowercase().contains("docker")) {
        required.insert("docker".to_string());
    }

    let mut missing = Vec::new();

    for binary in required {
        if !command_exists(&binary).await {
            missing.push(DependencyIssue {
                binary: binary.clone(),
                required_by: if binary == base {
                    "server command".to_string()
                } else {
                    "command/runtime requirements".to_string()
                },
                install_hint: install_hint_for(&binary),
            });
        }
    }

    missing.sort_by(|a, b| a.binary.cmp(&b.binary));
    missing
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

async fn read_json_response(
    reader: &mut Lines<BufReader<ChildStdout>>,
    context: &str,
) -> Result<Value, String> {
    for _ in 0..40 {
        let line = timeout(Duration::from_millis(300), reader.next_line()).await;
        match line {
            Ok(Ok(Some(raw))) => {
                if raw.trim().is_empty() {
                    continue;
                }
                if let Ok(value) = serde_json::from_str::<Value>(&raw) {
                    if value.get("jsonrpc").is_some() {
                        return Ok(value);
                    }
                }
            }
            Ok(Ok(None)) => {
                return Err(format!("Server closed the stream during {}", context));
            }
            Ok(Err(e)) => {
                return Err(format!("IO error during {}: {}", context, e));
            }
            Err(_) => {
                continue;
            }
        }
    }

    Err(format!(
        "Timed out waiting for MCP response during {}",
        context
    ))
}

fn derive_hints(message: &str, stderr_preview: &[String]) -> Vec<String> {
    let lower = message.to_ascii_lowercase();
    let stderr_blob = stderr_preview.join(" ").to_ascii_lowercase();
    let mut hints = Vec::new();

    if lower.contains("enoent")
        || lower.contains("not recognized")
        || stderr_blob.contains("not found")
    {
        hints.push("Verify the command exists on PATH and is spelled correctly.".to_string());
    }

    if lower.contains("permission denied") || stderr_blob.contains("permission denied") {
        hints.push("Check executable permissions and run the command manually once in your shell.".to_string());
    }

    if stderr_blob.contains("module not found") || stderr_blob.contains("cannot find module") {
        hints.push("Install missing Node dependencies (`npm install` / `pnpm install`) in the server project.".to_string());
    }

    if stderr_blob.contains("no module named") {
        hints.push("Install required Python packages in the active environment.".to_string());
    }

    if hints.is_empty() {
        hints.push("Open server logs after enabling for additional runtime details.".to_string());
    }

    hints
}

async fn terminate_child(child: &mut Child) -> Option<i32> {
    if let Ok(Some(status)) = child.try_wait() {
        return status.code();
    }

    let _ = child.kill().await;
    child.wait().await.ok().and_then(|status| status.code())
}

#[tauri::command]
pub async fn check_server_dependencies(input: DependencyCheckInput) -> Result<Vec<DependencyIssue>, String> {
    Ok(collect_missing_dependencies(&input.command, &input.args).await)
}

#[tauri::command]
pub async fn test_server_connection(
    _state: State<'_, AppState>,
    input: TestConnectionInput,
) -> Result<ConnectionTestResult, String> {
    if input.command.trim().is_empty() {
        return Ok(ConnectionTestResult {
            success: false,
            message: "Command is required".to_string(),
            exit_code: None,
            missing_dependencies: Vec::new(),
            hints: vec!["Provide a server command (for example `npx` or `python`).".to_string()],
            stderr_preview: Vec::new(),
        });
    }

    let mut env = input.env.clone();
    if let Some(server_id) = input.server_id.as_ref() {
        for key in &input.secrets {
            if env.contains_key(key) {
                continue;
            }
            if let Ok(secret) = SecretManager::get_secret(server_id, key) {
                env.insert(key.clone(), secret);
            }
        }
    }

    let missing_dependencies = collect_missing_dependencies(&input.command, &input.args).await;
    if !missing_dependencies.is_empty() {
        let hints = missing_dependencies
            .iter()
            .map(|d| d.install_hint.clone())
            .collect::<Vec<_>>();
        return Ok(ConnectionTestResult {
            success: false,
            message: "Missing prerequisites detected".to_string(),
            exit_code: None,
            missing_dependencies,
            hints,
            stderr_preview: Vec::new(),
        });
    }

    let mut command_builder = build_command(&input.command);
    let spawn_result = command_builder
        .args(input.args.clone())
        .envs(env)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();

    let mut child = match spawn_result {
        Ok(child) => child,
        Err(e) => {
            let message = format!("Failed to spawn server process: {}", e);
            return Ok(ConnectionTestResult {
                success: false,
                message: message.clone(),
                exit_code: None,
                missing_dependencies: Vec::new(),
                hints: derive_hints(&message, &[]),
                stderr_preview: Vec::new(),
            });
        }
    };

    let mut stdin = child.stdin.take().ok_or_else(|| "Failed to open stdin".to_string())?;
    let stdout = child.stdout.take().ok_or_else(|| "Failed to open stdout".to_string())?;
    let stderr = child.stderr.take().ok_or_else(|| "Failed to open stderr".to_string())?;

    let stderr_preview = Arc::new(Mutex::new(Vec::<String>::new()));
    let stderr_preview_task = Arc::clone(&stderr_preview);
    let stderr_task = tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let mut guard = stderr_preview_task.lock().await;
            if guard.len() >= 8 {
                break;
            }
            guard.push(line);
        }
    });

    let mut reader = BufReader::new(stdout).lines();
    let init_request = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "Relay-Diagnostics",
                "version": "1.0.0"
            }
        }
    });

    stdin
        .write_all(format!("{}\n", init_request).as_bytes())
        .await
        .map_err(|e| format!("Failed to send initialization request: {}", e))?;

    let result = read_json_response(&mut reader, "initialization").await;

    let stderr_lines = stderr_preview.lock().await.clone();
    let exit_code = terminate_child(&mut child).await;
    stderr_task.abort();

    match result {
        Ok(response) => {
            if let Some(error) = response.get("error") {
                let message = format!("Server returned MCP initialize error: {}", error);
                return Ok(ConnectionTestResult {
                    success: false,
                    message: message.clone(),
                    exit_code,
                    missing_dependencies: Vec::new(),
                    hints: derive_hints(&message, &stderr_lines),
                    stderr_preview: stderr_lines,
                });
            }

            Ok(ConnectionTestResult {
                success: true,
                message: "Server responded to MCP initialize successfully.".to_string(),
                exit_code,
                missing_dependencies: Vec::new(),
                hints: vec!["Connection test passed. You can safely save or enable this server.".to_string()],
                stderr_preview: stderr_lines,
            })
        }
        Err(message) => Ok(ConnectionTestResult {
            success: false,
            message: message.clone(),
            exit_code,
            missing_dependencies: Vec::new(),
            hints: derive_hints(&message, &stderr_lines),
            stderr_preview: stderr_lines,
        }),
    }
}
