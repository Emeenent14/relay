use tauri::{State, AppHandle};
use crate::commands::profiles::get_active_profile_id_from_db;
use crate::state::AppState;
use crate::models::server::{Server, CreateServerInput, UpdateServerInput};
use crate::utils::process::spawn_server;
use crate::utils::secrets::SecretManager;
use serde_json::Value;

#[tauri::command]
pub async fn sync_servers(state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;
    let enabled_servers = sqlx::query_as::<_, Server>(
        "SELECT * FROM servers WHERE enabled = 1 AND profile_id = ?",
    )
        .bind(&active_profile)
        .fetch_all(&*db)
        .await
        .map_err(|e| e.to_string())?;

    for server in enabled_servers {
        let mut processes = state.processes.lock().await;
        if !processes.contains_key(&server.id) {
            let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
            let envs: std::collections::HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();
            let secrets: Vec<String> = serde_json::from_str(&server.secrets).unwrap_or_default();
            
            match spawn_server(
                server.id.clone(),
                server.name.clone(),
                server.command.clone(),
                args,
                envs,
                secrets,
                app.clone(),
            ).await {
                Ok(proc) => {
                    processes.insert(server.id, proc);
                }
                Err(e) => {
                    println!("Failed to start server {}: {}", server.name, e);
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Value>, String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE profile_id = ? ORDER BY name")
        .bind(&active_profile)
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let mut result = Vec::new();
    let processes = state.processes.lock().await;
    let usage = state.context_usage.lock().await;

    for server in servers {
        let mut val = serde_json::to_value(&server).unwrap();
        let status = if processes.contains_key(&server.id) {
            "running"
        } else {
            "stopped"
        };

        if let Some(obj) = val.as_object_mut() {
            obj.insert("status".to_string(), serde_json::Value::String(status.to_string()));
            if let Some(context_usage) = usage.get(&server.id) {
                obj.insert(
                    "context_usage".to_string(),
                    serde_json::to_value(context_usage).unwrap_or(serde_json::Value::Null),
                );
            }
        }
        result.push(val);
    }

    Ok(result)
}

#[tauri::command]
pub async fn get_server(state: State<'_, AppState>, id: String) -> Result<Value, String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ? AND profile_id = ?")
        .bind(&id)
        .bind(&active_profile)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    let processes = state.processes.lock().await;
    let usage = state.context_usage.lock().await;
    let mut val = serde_json::to_value(&server).unwrap();
    let status = if processes.contains_key(&server.id) {
        "running"
    } else {
        "stopped"
    };
    if let Some(obj) = val.as_object_mut() {
        obj.insert("status".to_string(), serde_json::Value::String(status.to_string()));
        if let Some(context_usage) = usage.get(&server.id) {
            obj.insert(
                "context_usage".to_string(),
                serde_json::to_value(context_usage).unwrap_or(serde_json::Value::Null),
            );
        }
    }

    Ok(val)
}

#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    input: CreateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    // Check for duplicate marketplace server
    if let Some(ref marketplace_id) = input.marketplace_id {
        let existing = sqlx::query_as::<_, Server>(
            "SELECT * FROM servers WHERE marketplace_id = ? AND profile_id = ?"
        )
        .bind(marketplace_id)
        .bind(&active_profile)
        .fetch_optional(&*db)
        .await
        .map_err(|e| e.to_string())?;

        if existing.is_some() {
            return Err(format!("Server '{}' is already installed from the catalog", input.name));
        }
    }

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let args_json = serde_json::to_string(&input.args.unwrap_or_default())
        .map_err(|e| e.to_string())?;
    
    // Separate secrets from normal env
    let mut env = input.env.unwrap_or_default();
    let secret_mapping = input.secrets.unwrap_or_default();
    let mut secret_keys = Vec::new();

    for key in secret_mapping {
        if let Some(value) = env.remove(&key) {
            SecretManager::set_secret(&id, &key, &value)?;
            secret_keys.push(key);
        }
    }

    let env_json = serde_json::to_string(&env).map_err(|e| e.to_string())?;
    let secrets_json = serde_json::to_string(&secret_keys).map_err(|e| e.to_string())?;
    let category = input.category.unwrap_or_else(|| "other".to_string());
    let source = if input.marketplace_id.is_some() { "marketplace" } else { "local" };

    sqlx::query(
        "INSERT INTO servers (id, name, description, command, args, env, secrets, enabled, category, profile_id, source, marketplace_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.command)
    .bind(&args_json)
    .bind(&env_json)
    .bind(&secrets_json)
    .bind(&category)
    .bind(&active_profile)
    .bind(&source)
    .bind(&input.marketplace_id)
    .bind(&now)
    .bind(&now)
    .execute(&*db)
    .await
    .map_err(|e| format!("Failed to create server: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_server(
    state: State<'_, AppState>,
    app: AppHandle,
    input: UpdateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    let mut server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ? AND profile_id = ?")
        .bind(&input.id)
        .bind(&active_profile)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    if let Some(name) = input.name { server.name = name; }
    if let Some(desc) = input.description { server.description = Some(desc); }
    if let Some(cmd) = input.command { server.command = cmd; }
    if let Some(args) = input.args {
        server.args = serde_json::to_string(&args).map_err(|e| e.to_string())?;
    }
    if let Some(env_map) = input.env {
        let mut env = env_map;
        let secret_mapping = input.secrets.unwrap_or_default();
        let mut secret_keys = Vec::new();

        for key in secret_mapping {
            if let Some(value) = env.remove(&key) {
                SecretManager::set_secret(&server.id, &key, &value)?;
                secret_keys.push(key);
            }
        }
        server.env = serde_json::to_string(&env).map_err(|e| e.to_string())?;
        server.secrets = serde_json::to_string(&secret_keys).map_err(|e| e.to_string())?;
    }
    
    if let Some(enabled) = input.enabled { server.enabled = enabled; }
    if let Some(cat) = input.category { server.category = cat; }

    server.updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE servers SET name = ?, description = ?, command = ?, args = ?, env = ?, secrets = ?, enabled = ?, category = ?, updated_at = ? WHERE id = ? AND profile_id = ?"
    )
    .bind(&server.name)
    .bind(&server.description)
    .bind(&server.command)
    .bind(&server.args)
    .bind(&server.env)
    .bind(&server.secrets)
    .bind(&server.enabled)
    .bind(&server.category)
    .bind(&server.updated_at)
    .bind(&server.id)
    .bind(&active_profile)
    .execute(&*db)
    .await
    .map_err(|e| format!("Failed to update server: {}", e))?;

    // Restart process if enabled and running
    let mut processes = state.processes.lock().await;
    if let Some(mut proc) = processes.remove(&server.id) {
        let _ = proc.child.kill().await;
    }
    
    if server.enabled {
        let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
        let envs: std::collections::HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();
        let secrets: Vec<String> = serde_json::from_str(&server.secrets).unwrap_or_default();
        if let Ok(proc) = spawn_server(server.id.clone(), server.name.clone(), server.command.clone(), args, envs, secrets, app).await {
            processes.insert(server.id.clone(), proc);
        }
    }

    Ok(server)
}

#[tauri::command]
pub async fn delete_server(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    // Fetch server to get secret keys before deletion
    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ? AND profile_id = ?")
        .bind(&id)
        .bind(&active_profile)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    sqlx::query("DELETE FROM servers WHERE id = ? AND profile_id = ?")
        .bind(&id)
        .bind(&active_profile)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to delete server: {}", e))?;

    // Delete secrets from keyring
    let secret_keys: Vec<String> = serde_json::from_str(&server.secrets).unwrap_or_default();
    let _ = SecretManager::delete_all_server_secrets(&id, secret_keys);

    let mut processes = state.processes.lock().await;
    if let Some(mut proc) = processes.remove(&id) {
        let _ = proc.child.kill().await;
    }

    Ok(())
}

#[tauri::command]
pub async fn toggle_server(state: State<'_, AppState>, app: AppHandle, id: String) -> Result<Server, String> {
    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query("UPDATE servers SET enabled = NOT enabled, updated_at = ? WHERE id = ? AND profile_id = ?")
        .bind(&now)
        .bind(&id)
        .bind(&active_profile)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to toggle server: {}", e))?;

    let server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ? AND profile_id = ?")
        .bind(&id)
        .bind(&active_profile)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())?;

    let mut processes = state.processes.lock().await;
    if server.enabled {
        let args: Vec<String> = serde_json::from_str(&server.args).unwrap_or_default();
        let envs: std::collections::HashMap<String, String> = serde_json::from_str(&server.env).unwrap_or_default();
        let secrets: Vec<String> = serde_json::from_str(&server.secrets).unwrap_or_default();
        if let Ok(proc) = spawn_server(server.id.clone(), server.name.clone(), server.command.clone(), args, envs, secrets, app).await {
            processes.insert(server.id.clone(), proc);
        }
    } else {
        if let Some(mut proc) = processes.remove(&id) {
            let _ = proc.child.kill().await;
        }
    }

    Ok(server)
}
