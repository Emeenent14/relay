use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;
use tokio::process::Child;

pub struct ServerProcess {
    pub child: Child,
    pub status: String,
}

pub struct AppState {
    pub db: Arc<Mutex<SqlitePool>>,
    pub processes: Arc<Mutex<HashMap<String, ServerProcess>>>,
}

impl AppState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}
