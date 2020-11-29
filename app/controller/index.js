const db = require('../db/index.js');
const { table, getBorderCharacters, createStream } = require('table');
const notificationService = require('../services/notificationService.js');

const messageController = {
  scheduleEvent(eventName, description, channel) {
    db.all(`INSERT INTO events (name, description) VALUES ('${eventName}','${description}')`, (err, row) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          channel.send(`:x: Event name **${eventName}** already exists`);
        }
        console.error(err.message);
      } else {
        channel.send(`:white_check_mark: Successfully scheduled event: **${eventName} ${description}**`);
      }
    });
  },
  deleteEvent(eventName, channel) {
    db.all(`DELETE FROM users_events WHERE event_id = (SELECT id FROM events WHERE name = '${eventName}')`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        db.all(`DELETE FROM events WHERE name = '${eventName}'`, (err) => {
          if (err) {
            console.error(err.message);
          } else {
            channel.send(`:white_check_mark: Successfully cancelled event: **${eventName}**`);
          }
        });
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
        notificationService.init(channel);
        channel.send(`:white_check_mark: Successfully scheduled **${eventName}** for **${date}**`);
      }
    });
  },
  getInfo(eventName, channel) {
    db.all(`SELECT * FROM events WHERE name = '${eventName}'`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else if (!row.length) {
        channel.send(`**${eventName}** not found`);
      } else {
        const { id, name, description } = row[0];
        let { date } = row[0];
        db.all(`SELECT * FROM users_events WHERE event_id = ${id}`, (err, row) => {
          let users = row.map(u => u.username).join(", ");
          if (!users) {
            users = "none";
          }
          if (!date) {
            date = "none";
          }
          const data = [
            ['Event', `${name} ${description}`],
            // ['Description', `${description}`],
            ['Users', `${users}`],
            ['Date', `${date}`]
          ];
          options = {
            border: getBorderCharacters(`void`),
          };
          const output = table(data, options);
          const formattedOutput = "```" + `${output}` + "```";
          channel.send(formattedOutput);
        });
      }
    })
  },
  toggleNotifications(eventName, channel) {
    db.all(`SELECT * FROM events WHERE name = '${eventName}'`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else if (!row.length) {
        channel.send(':x: command not recognized');
      }
      else {
        const { notifications, date } = row[0];
        if (notifications === "yes") {
          db.all(`UPDATE events SET notifications = 'no' WHERE name = '${eventName}'`, (err, row) => {
            if (err) {
              console.error(err.message);
            } else {
              notificationService.init(channel);
              channel.send(`:white_check_mark: Successfully turned **OFF** notifications for **${eventName}**`);
            }
          });
        } else if (notifications === "no"  || !notifications) {
          db.all(`UPDATE events SET notifications = 'yes' WHERE name = '${eventName}'`, (err, row) => {
            if (err) {
              console.error(err.message);
            } else {
              notificationService.init(channel);
              channel.send(`:white_check_mark: Successfully turned **ON** user mentions for **${eventName}**`);
            }
          });
        }
      }
    })
  },
  addEventDescription(eventName, description, channel) {
    db.all(`UPDATE events SET description = '${description}' WHERE name = '${eventName}'`, (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        channel.send(`:white_check_mark: Successfully added description for **${eventName}**`);
      }
    });
  },
  help(channel) {
    const data = [
      ['Command', 'Syntax'],
      ['Schedule a New Event', '!schedule [EVENT_NAME] [DESCRIPTION]'],
      ['Cancel Event', '![EVENT_NAME] cancel'],
      ['Add Event Description', '![EVENT_NAME] description [DESCRIPTION]'],
      ['Add User to Event', '![EVENT_NAME] add [@USERNAME]'],
      ['Remove User from Event', '![EVENT_NAME] remove [@USERNAME]'],
      ['Add/Update Date for Event(Currently MST)', '![EVENT_NAME] date [mm[/.-]dd[/.-]yyyy hh:mm:ss am|pm]'],
      ['Get Event Info', '![EVENT_NAME] info'],
    ];
    options = {
      border: getBorderCharacters(`void`),
    };
    const output = table(data, options);
    let formattedOutput = "```" + `${output}` + "```";
    channel.send(formattedOutput);
  }
};

module.exports = messageController;