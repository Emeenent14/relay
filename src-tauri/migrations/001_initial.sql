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
    profile_id TEXT DEFAULT 'default',
    source TEXT DEFAULT 'local',
    marketplace_id TEXT,
    icon_url TEXT,
    documentation_url TEXT,
    secrets TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
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
CREATE INDEX IF NOT EXISTS idx_servers_profile ON servers(profile_id);

-- Default settings
INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('theme', '"system"', datetime('now'));

INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('autoExport', 'true', datetime('now'));

INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('activeProfile', 'default', datetime('now'));

INSERT OR IGNORE INTO profiles (id, name, created_at, updated_at)
VALUES ('default', 'Default', datetime('now'), datetime('now'));
