use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: String,
    pub env: String,
    pub secrets: String, // JSON array of secret keys
    pub enabled: bool,
    pub category: String,
    pub source: String,
    pub marketplace_id: Option<String>,
    pub icon_url: Option<String>,
    pub documentation_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateServerInput {
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub secrets: Option<Vec<String>>,
    pub category: Option<String>,
    pub marketplace_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServerInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub command: Option<String>,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub secrets: Option<Vec<String>>,
    pub enabled: Option<bool>,
    pub category: Option<String>,
}
