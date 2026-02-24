import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'app.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
  }
  return db
}

export function initDatabase() {
  const db = getDatabase()

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      password TEXT NOT NULL,
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      data TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status INTEGER NOT NULL DEFAULT 0,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      attachments TEXT NOT NULL DEFAULT '{}',
      comments TEXT NOT NULL DEFAULT '{}',
      tags TEXT NOT NULL DEFAULT '{}',
      labels TEXT NOT NULL DEFAULT '{}',
      assignees TEXT NOT NULL DEFAULT '{}',
      priority INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'task',
      subtasks TEXT NOT NULL DEFAULT '{}',
      due_date TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL DEFAULT '{}',
      status INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create index on data.name
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_data_name ON data(name)
  `)

  // Create sprints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}
