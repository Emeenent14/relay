use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub db: Arc<Mutex<SqlitePool>>,
}

impl AppState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
        }
    }
}
