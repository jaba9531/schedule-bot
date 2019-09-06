const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, './storage/events.db');

// open the database
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the events database.');
    db.serialize(() => {
      db.each(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name, date);`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
      });
      db.each(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name);`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
      });
      db.each(`CREATE TABLE IF NOT EXISTS users_events (user_id INTEGER, event_id INTEGER, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (event_id) REFERENCES events(id));`, (err, row) => {
          if (err) {
            console.error(err.message);
          }
      });
      // Testing only
      // db.each(`INSERT INTO events (name, users, date) VALUES( "game", "name", "8/20/2013");`, (err, row) => {
      //   if (err) {
      //     console.log("here");
      //     console.error(err.message);
      //   }
      // });
    });
  }
});
   
module.exports = db;

  