
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

db.serialize(()=>{
 db.run(`CREATE TABLE IF NOT EXISTS server_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  status TEXT DEFAULT 'active'
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS license_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  hwid TEXT,
  expire TEXT
 )`);
});

module.exports = db;
