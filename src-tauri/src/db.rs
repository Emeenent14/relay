use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::PathBuf;

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    let db_path = get_db_path();

    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).expect("Failed to create database directory");
    }

    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run migrations - use raw_execute for multi-statement SQL
    let migration_sql = include_str!("../migrations/001_initial.sql");
    sqlx::raw_sql(migration_sql)
        .execute(&pool)
        .await?;

    ensure_profile_schema(&pool).await?;
    ensure_server_columns(&pool).await?;

    Ok(pool)
}

fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .expect("Could not determine data directory")
        .join("relay");

    data_dir.join("data.db")
}

/// Add new columns to existing servers table for rollback and remote transport support.
async fn ensure_server_columns(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let columns = [
        ("previous_config", "TEXT"),
        ("transport", "TEXT DEFAULT 'stdio'"),
        ("url", "TEXT"),
    ];

    for (col, col_type) in &columns {
        let has_col: Option<String> = sqlx::query_scalar(
            &format!("SELECT name FROM pragma_table_info('servers') WHERE name = '{}'", col),
        )
        .fetch_optional(pool)
        .await?;

        if has_col.is_none() {
            sqlx::query(&format!("ALTER TABLE servers ADD COLUMN {} {}", col, col_type))
                .execute(pool)
                .await?;
        }
    }

    Ok(())
}

async fn ensure_profile_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let has_profile_column: Option<String> = sqlx::query_scalar(
        "SELECT name FROM pragma_table_info('servers') WHERE name = 'profile_id'",
    )
    .fetch_optional(pool)
    .await?;

    if has_profile_column.is_none() {
        sqlx::query("ALTER TABLE servers ADD COLUMN profile_id TEXT DEFAULT 'default'")
            .execute(pool)
            .await?;
    }

    sqlx::query("UPDATE servers SET profile_id = 'default' WHERE profile_id IS NULL OR profile_id = ''")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_servers_profile ON servers(profile_id)")
        .execute(pool)
        .await?;

    sqlx::query(
        "INSERT OR IGNORE INTO profiles (id, name, created_at, updated_at) VALUES ('default', 'Default', datetime('now'), datetime('now'))",
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('activeProfile', 'default', datetime('now'))",
    )
    .execute(pool)
    .await?;

    Ok(())
}
