const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, "database.sqlite"));
db.pragma("foreign_keys = ON");

module.exports = { db };
