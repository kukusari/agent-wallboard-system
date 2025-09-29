const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const path = require('path');

let sqliteDb = null;

// SQLite Connection
function initSQLite() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.SQLITE_DB_PATH || '../database/sqlite/wallboard.db';
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite connection error:', err);
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database');
        resolve();
      }
    });
  });
}

// MongoDB Connection
async function connectMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallboard';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

function getSQLiteDB() {
  return sqliteDb;
}

module.exports = {
  initSQLite,
  connectMongoDB,
  getSQLiteDB
};