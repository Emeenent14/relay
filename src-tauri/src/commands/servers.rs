use tauri::State;
use crate::state::AppState;
use crate::models::server::{Server, CreateServerInput, UpdateServerInput};

#[tauri::command]
pub async fn get_servers(state: State<'_, AppState>) -> Result<Vec<Server>, String> {
    let db = state.db.lock().await;

    sqlx::query_as::<_, Server>("SELECT * FROM servers ORDER BY name")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Database error: {}", e))
}

#[tauri::command]
pub async fn get_server(state: State<'_, AppState>, id: String) -> Result<Server, String> {
    let db = state.db.lock().await;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))
}

#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    input: CreateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let args_json = serde_json::to_string(&input.args.unwrap_or_default())
        .map_err(|e| e.to_string())?;
    let env_json = serde_json::to_string(&input.env.unwrap_or_default())
        .map_err(|e| e.to_string())?;
    let category = input.category.unwrap_or_else(|| "other".to_string());

    sqlx::query(
        "INSERT INTO servers (id, name, description, command, args, env, enabled, category, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'local', ?, ?)"
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.command)
    .bind(&args_json)
    .bind(&env_json)
    .bind(&category)
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
    input: UpdateServerInput,
) -> Result<Server, String> {
    let db = state.db.lock().await;

    let mut server = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&input.id)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Server not found: {}", e))?;

    if let Some(name) = input.name { server.name = name; }
    if let Some(desc) = input.description { server.description = Some(desc); }
    if let Some(cmd) = input.command { server.command = cmd; }
    if let Some(args) = input.args {
        server.args = serde_json::to_string(&args).map_err(|e| e.to_string())?;
    }
    if let Some(env) = input.env {
        server.env = serde_json::to_string(&env).map_err(|e| e.to_string())?;
    }
    if let Some(enabled) = input.enabled { server.enabled = enabled; }
    if let Some(cat) = input.category { server.category = cat; }

    server.updated_at = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE servers SET name = ?, description = ?, command = ?, args = ?, env = ?, enabled = ?, category = ?, updated_at = ? WHERE id = ?"
    )
    .bind(&server.name)
    .bind(&server.description)
    .bind(&server.command)
    .bind(&server.args)
    .bind(&server.env)
    .bind(&server.enabled)
    .bind(&server.category)
    .bind(&server.updated_at)
    .bind(&server.id)
    .execute(&*db)
    .await
    .map_err(|e| format!("Failed to update server: {}", e))?;

    Ok(server)
}

#[tauri::command]
pub async fn delete_server(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().await;

    sqlx::query("DELETE FROM servers WHERE id = ?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to delete server: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn toggle_server(state: State<'_, AppState>, id: String) -> Result<Server, String> {
    let db = state.db.lock().await;
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query("UPDATE servers SET enabled = NOT enabled, updated_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to toggle server: {}", e))?;

    sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE id = ?")
        .bind(&id)
        .fetch_one(&*db)
        .await
        .map_err(|e| e.to_string())
}
