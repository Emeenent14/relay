use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;
use tokio::process::Child;
use crate::proxy::ContextUsageStats;

pub struct ServerProcess {
    pub child: Child,
}

pub struct AppState {
    pub db: Arc<Mutex<SqlitePool>>,
    pub processes: Arc<Mutex<HashMap<String, ServerProcess>>>,
    pub context_usage: Arc<Mutex<HashMap<String, ContextUsageStats>>>,
}

impl AppState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
            processes: Arc::new(Mutex::new(HashMap::new())),
            context_usage: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}
