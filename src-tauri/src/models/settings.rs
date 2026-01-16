use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    #[serde(rename = "autoExport")]
    pub auto_export: bool,
}
