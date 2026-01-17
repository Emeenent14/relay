// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;
mod state;
mod utils;

use state::AppState;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    // Initialize database
    let db_pool = db::init_db()
        .await
        .expect("Failed to initialize database");

    // Create app state
    let app_state = AppState {
        db: Arc::new(Mutex::new(db_pool)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Server commands
            commands::servers::get_servers,
            commands::servers::get_server,
            commands::servers::create_server,
            commands::servers::update_server,
            commands::servers::delete_server,
            commands::servers::toggle_server,
            // Config commands
            commands::config::get_config_path,
            commands::config::export_to_claude,
            commands::config::export_config,
            commands::config::read_claude_config,
            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_setting,
            commands::settings::update_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
