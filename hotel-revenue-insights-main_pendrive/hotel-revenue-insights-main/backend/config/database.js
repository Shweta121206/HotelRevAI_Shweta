const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create/connect to SQLite database
const dbPath = path.join(dataDir, 'hotel-revenue.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS upload_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      hotelName TEXT,
      fileName TEXT NOT NULL,
      fileSize INTEGER,
      fileType TEXT,
      recordsCount INTEGER,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'success'
    )
  `);
  console.log('Upload history table ready');
};

initializeDatabase();

// Promisify database operations
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(...params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(...params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { db, dbRun, dbGet, dbAll };
