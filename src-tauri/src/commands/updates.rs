use serde::{Deserialize, Serialize};
use reqwest::header::USER_AGENT;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateResponse {
    pub update_available: bool,
    pub remote_version: String,
    pub url: String,
}

#[derive(Debug, Deserialize)]
struct GithubRelease {
    tag_name: String,
    html_url: String,
}

#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<UpdateResponse, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("https://api.github.com/repos/emeenent14/Relay/releases/latest")
        .header(USER_AGENT, "Relay-App")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Failed to fetch updates: {}", res.status()));
    }

    let release: GithubRelease = res.json().await.map_err(|e| e.to_string())?;
    
    // Get current version from Tauri config
    let current_version = app.package_info().version.to_string();
    let remote_version = release.tag_name.trim_start_matches('v').to_string();

    let update_available = is_newer(&remote_version, &current_version);

    Ok(UpdateResponse {
        update_available,
        remote_version,
        url: release.html_url,
    })
}

fn is_newer(remote: &str, current: &str) -> bool {
    let remote_parts: Vec<&str> = remote.split('.').collect();
    let current_parts: Vec<&str> = current.split('.').collect();

    for i in 0..std::cmp::max(remote_parts.len(), current_parts.len()) {
        let r = remote_parts.get(i).unwrap_or(&"0").parse::<u32>().unwrap_or(0);
        let c = current_parts.get(i).unwrap_or(&"0").parse::<u32>().unwrap_or(0);
        
        if r > c { return true; }
        if r < c { return false; }
    }
    false
}
