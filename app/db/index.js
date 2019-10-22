const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, './storage/events.db');

// open the database
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the events database.');
    // Create Events Table
    db.serialize(() => {
      db.all(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name UNIQUE, description, date, notifications);`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
      });
      // Create Users_Events Table
      db.all(`CREATE TABLE IF NOT EXISTS users_events (username, event_id INTEGER);`, (err, row) => {
          if (err) {
            console.error(err.message);
          }
      });
    });
  }
});
   
module.exports = db;

  