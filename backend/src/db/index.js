import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = path.dirname(config.databasePath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(config.uploadsDir)) fs.mkdirSync(config.uploadsDir, { recursive: true });

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// --- Migration: site_settings.cafe_name -----------------------------------
// `CREATE TABLE IF NOT EXISTS` in schema.sql only shapes a brand-new
// database — an existing install needs an explicit ALTER TABLE to pick up a
// newly added column. Guarded by checking PRAGMA table_info so it runs at
// most once per database and is a no-op on fresh installs (schema.sql
// already created the column there). Backfills cafe_name from the current
// hero_title so nothing on the public site goes blank for anyone upgrading.
const siteSettingsColumns = db.prepare('PRAGMA table_info(site_settings)').all();
if (!siteSettingsColumns.some((col) => col.name === 'cafe_name')) {
  db.exec("ALTER TABLE site_settings ADD COLUMN cafe_name TEXT NOT NULL DEFAULT ''");
  db.prepare("UPDATE site_settings SET cafe_name = hero_title WHERE id = 1 AND cafe_name = ''").run();
  console.log('Migrated: added site_settings.cafe_name (backfilled from hero_title).');
}
