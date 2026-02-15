use crate::models::profile::Profile;
use crate::state::AppState;
use tauri::{AppHandle, State};

pub async fn get_active_profile_id_from_db(db: &sqlx::SqlitePool) -> Result<String, String> {
    let active: Option<String> =
        sqlx::query_scalar("SELECT value FROM settings WHERE key = 'activeProfile'")
            .fetch_optional(db)
            .await
            .map_err(|e| format!("Failed to read active profile: {}", e))?;

    Ok(active.unwrap_or_else(|| "default".to_string()))
}

#[tauri::command]
pub async fn get_profiles(state: State<'_, AppState>) -> Result<Vec<Profile>, String> {
    let db = state.db.lock().await;

    sqlx::query_as::<_, Profile>("SELECT * FROM profiles ORDER BY CASE WHEN id = 'default' THEN 0 ELSE 1 END, name")
        .fetch_all(&*db)
        .await
        .map_err(|e| format!("Failed to fetch profiles: {}", e))
}

#[tauri::command]
pub async fn get_active_profile(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().await;
    get_active_profile_id_from_db(&*db).await
}

fn slugify(name: &str) -> String {
    let mut out = String::new();
    let mut prev_dash = false;

    for ch in name.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
            prev_dash = false;
        } else if !prev_dash {
            out.push('-');
            prev_dash = true;
        }
    }

    out.trim_matches('-').to_string()
}

#[tauri::command]
pub async fn create_profile(state: State<'_, AppState>, name: String) -> Result<Profile, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Profile name is required".to_string());
    }

    let db = state.db.lock().await;

    let base_id = {
        let slug = slugify(trimmed);
        if slug.is_empty() {
            format!("profile-{}", uuid::Uuid::new_v4().simple())
        } else {
            slug
        }
    };

    let mut candidate = base_id.clone();
    let mut suffix = 1;
    loop {
        let exists: Option<String> = sqlx::query_scalar("SELECT id FROM profiles WHERE id = ?")
            .bind(&candidate)
            .fetch_optional(&*db)
            .await
            .map_err(|e| format!("Failed to check profile id: {}", e))?;
        if exists.is_none() {
            break;
        }
        suffix += 1;
        candidate = format!("{}-{}", base_id, suffix);
    }

    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query("INSERT INTO profiles (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)")
        .bind(&candidate)
        .bind(trimmed)
        .bind(&now)
        .bind(&now)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to create profile: {}", e))?;

    sqlx::query_as::<_, Profile>("SELECT * FROM profiles WHERE id = ?")
        .bind(&candidate)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Failed to load created profile: {}", e))
}

#[tauri::command]
pub async fn set_active_profile(
    state: State<'_, AppState>,
    app: AppHandle,
    profile_id: String,
) -> Result<String, String> {
    {
        let db = state.db.lock().await;

        let exists: Option<String> = sqlx::query_scalar("SELECT id FROM profiles WHERE id = ?")
            .bind(&profile_id)
            .fetch_optional(&*db)
            .await
            .map_err(|e| format!("Failed to verify profile: {}", e))?;

        if exists.is_none() {
            return Err(format!("Profile '{}' does not exist", profile_id));
        }

        sqlx::query("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'activeProfile'")
            .bind(&profile_id)
            .bind(chrono::Utc::now().to_rfc3339())
            .execute(&*db)
            .await
            .map_err(|e| format!("Failed to switch profile: {}", e))?;
    }

    // Stop currently running servers before syncing the new profile.
    {
        let mut processes = state.processes.lock().await;
        let mut running = Vec::new();
        for (_id, process) in processes.drain() {
            running.push(process.child);
        }
        drop(processes);

        for mut child in running {
            let _ = child.kill().await;
        }
    }

    super::servers::sync_servers(state, app).await?;
    Ok(profile_id)
}
