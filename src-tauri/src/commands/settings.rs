use tauri::State;
use crate::state::AppState;
use crate::models::settings::AppSettings;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    let db = state.db.lock().await;

    let theme: String = sqlx::query_scalar("SELECT value FROM settings WHERE key = 'theme'")
        .fetch_one(&*db)
        .await
        .unwrap_or_else(|_| "system".to_string());

    let auto_export: String = sqlx::query_scalar("SELECT value FROM settings WHERE key = 'autoExport'")
        .fetch_one(&*db)
        .await
        .unwrap_or_else(|_| "false".to_string());

    Ok(AppSettings {
        theme,
        auto_export: auto_export == "true",
    })
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    let db = state.db.lock().await;

    sqlx::query("UPDATE settings SET value = ? WHERE key = 'theme'")
        .bind(&settings.theme)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to update theme: {}", e))?;

    sqlx::query("UPDATE settings SET value = ? WHERE key = 'autoExport'")
        .bind(if settings.auto_export { "true" } else { "false" })
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to update autoExport: {}", e))?;

    Ok(settings)
}

#[tauri::command]
pub async fn get_setting(state: State<'_, AppState>, key: String) -> Result<String, String> {
    let db = state.db.lock().await;

    sqlx::query_scalar("SELECT value FROM settings WHERE key = ?")
        .bind(&key)
        .fetch_one(&*db)
        .await
        .map_err(|e| format!("Setting not found: {}", e))
}

#[tauri::command]
pub async fn update_setting(
    state: State<'_, AppState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let db = state.db.lock().await;

    sqlx::query("UPDATE settings SET value = ? WHERE key = ?")
        .bind(&value)
        .bind(&key)
        .execute(&*db)
        .await
        .map_err(|e| format!("Failed to update setting: {}", e))?;

    Ok(())
}
