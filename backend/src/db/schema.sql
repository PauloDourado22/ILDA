CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Singleton row (id always 1) holding the editable homepage copy. A single-row
-- table is a deliberate simplification over a generic key-value settings
-- table — there's exactly one café, exactly one set of homepage text, so a
-- fixed-shape row is easier to reason about and query than a KV blob.
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  about_text TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per weekday, always present (seeded for all 7 days) so the admin
-- UI is always editing existing rows (UPDATE), never worrying about
-- inserting a missing day.
CREATE TABLE IF NOT EXISTS hours (
  weekday INTEGER PRIMARY KEY, -- 0=Sunday .. 6=Saturday
  open_minute INTEGER,
  close_minute INTEGER,
  closed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_path TEXT, -- relative path under /uploads, nullable
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
