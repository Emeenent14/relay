use std::path::PathBuf;

pub fn get_claude_config_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;

    #[cfg(target_os = "macos")]
    let path = home.join("Library/Application Support/Claude/claude_desktop_config.json");

    #[cfg(target_os = "windows")]
    let path = home.join("AppData/Roaming/Claude/claude_desktop_config.json");

    #[cfg(target_os = "linux")]
    let path = home.join(".config/claude/claude_desktop_config.json");

    Some(path)
}
