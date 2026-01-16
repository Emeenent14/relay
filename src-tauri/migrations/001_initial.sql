-- Initial database schema for Relay

CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    command TEXT NOT NULL,
    args TEXT DEFAULT '[]',
    env TEXT DEFAULT '{}',
    enabled INTEGER DEFAULT 0,
    category TEXT DEFAULT 'other',
    source TEXT DEFAULT 'local',
    marketplace_id TEXT,
    icon_url TEXT,
    documentation_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_servers_enabled ON servers(enabled);
CREATE INDEX IF NOT EXISTS idx_servers_category ON servers(category);

-- Default settings
INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('theme', '"system"', datetime('now'));

INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('autoExport', 'true', datetime('now'));
