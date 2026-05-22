PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  email_key TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_normalized_email ON users(normalized_email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  granted_at TEXT NOT NULL,
  granted_by_user_id TEXT,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (granted_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_active_unique ON user_roles(user_id, role_id) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  target_user_id TEXT,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_user_id ON audit_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_target_user_id ON audit_events(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);

INSERT OR IGNORE INTO roles (key, name)
VALUES ('admin', 'Admin');

ALTER TABLE waitlist_entries ADD COLUMN user_id TEXT REFERENCES users(id);

INSERT OR IGNORE INTO users (
  id,
  email,
  normalized_email,
  email_key,
  name,
  status,
  created_at,
  updated_at,
  last_login_at
)
SELECT
  lower(hex(randomblob(16))),
  email,
  email_normalized,
  email_key,
  name,
  'active',
  created_at,
  created_at,
  NULL
FROM waitlist_entries;

UPDATE waitlist_entries
SET user_id = (
  SELECT users.id
  FROM users
  WHERE users.email_key = waitlist_entries.email_key
)
WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_user_id ON waitlist_entries(user_id);
