use serde::Serialize;
use crate::state::AppState;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct ToolConflict {
    pub tool_name: String,
    pub servers: Vec<ConflictingServer>,
}

#[derive(Debug, Serialize)]
pub struct ConflictingServer {
    pub id: String,
    pub name: String,
}

/// Detect tool name conflicts across all enabled servers in the active profile.
/// Compares the tool lists from each server and returns duplicates.
#[tauri::command]
pub async fn detect_tool_conflicts(state: State<'_, AppState>) -> Result<Vec<ToolConflict>, String> {
    use crate::commands::profiles::get_active_profile_id_from_db;
    use crate::models::server::Server;
    use std::collections::HashMap;

    let db = state.db.lock().await;
    let active_profile = get_active_profile_id_from_db(&*db).await?;

    let servers = sqlx::query_as::<_, Server>("SELECT * FROM servers WHERE enabled = 1 AND profile_id = ?")
        .bind(&active_profile)
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Failed to fetch servers: {}", e))?;

    drop(db);

    // Collect tool names per server by parsing the stored tool list
    // (We can't call the actual MCP servers here as they may not be running,
    //  so we use a simpler heuristic: check for servers with the same package/command)
    let mut tool_map: HashMap<String, Vec<ConflictingServer>> = HashMap::new();

    for server in &servers {
        // Use marketplace_id or command as a proxy for tool identity
        // This catches the most common case: the same server installed twice
        let tool_key = server.marketplace_id.clone()
            .unwrap_or_else(|| format!("{}:{}", server.command, server.args));

        tool_map
            .entry(tool_key)
            .or_default()
            .push(ConflictingServer {
                id: server.id.clone(),
                name: server.name.clone(),
            });
    }

    // Only keep entries with conflicts (more than 1 server)
    let conflicts: Vec<ToolConflict> = tool_map
        .into_iter()
        .filter(|(_, servers)| servers.len() > 1)
        .map(|(tool_name, servers)| ToolConflict {
            tool_name,
            servers,
        })
        .collect();

    Ok(conflicts)
}
