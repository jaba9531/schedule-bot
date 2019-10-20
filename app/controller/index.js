const db = require('../db/index.js');

const messageController = {
  scheduleEvent(eventName, channel) {
    db.all(`INSERT INTO events (name) VALUES ('${eventName}')`, (err, row) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          channel.send(`:x: Event name **${eventName}** already exists`);
        }
        console.error(err.message);
      } else {
        channel.send(`:white_check_mark: Successfully scheduled event: **${eventName}**`);
      }
    });
  },
  addUser(username, eventName, channel) {
    db.all(`SELECT username, event_id FROM users_events WHERE username = '${username}' AND event_id = (SELECT id FROM events WHERE name = '${eventName}')`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        if (row.length) {
          channel.send(`:x: **${username}** has already been added to **${eventName}**`);
        } else {
          db.all(`INSERT INTO users_events (username, event_id) VALUES ('${username}', (SELECT id FROM events WHERE name = '${eventName}'))`, (err, row) => {
            if (err) {
              console.error(err.message);
            } else {
              channel.send(`:white_check_mark: Successfully added **${username}** to **${eventName}**`);
            }
          });
        }
      }
    });
  },
  removeUser(username, eventName, channel) {
    db.all(`SELECT username, event_id FROM users_events WHERE username = '${username}' AND event_id = (SELECT id FROM events WHERE name = '${eventName}')`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        if (!row.length) {
          channel.send(`:x: **${username}** not found in **${eventName}**`);
        } else {
          db.all(`DELETE FROM users_events WHERE username = '${username}' AND event_id = (SELECT id FROM events WHERE name = '${eventName}')`, (err, row) => {
            if (err) {
              console.error(err.message);
            } else {
              channel.send(`:white_check_mark: Successfully removed **${username}** from **${eventName}**`);
            }
          });
        }
      }
    });
  },
  addDate(eventName, channel, date) {
    db.all(`UPDATE events SET date = '${date}' WHERE name = '${eventName}'`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        channel.send(`:white_check_mark: Successfully scheduled **${eventName}** for **${date}**`);
      }
    });
  },
  getInfo(eventName, channel) {
    db.all(`SELECT name, date FROM events`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(row, "row");
      }
    })
  }
};

module.exports = messageController;