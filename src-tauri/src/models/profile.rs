use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}
