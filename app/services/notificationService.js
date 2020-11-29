const db = require('../db/index.js');
const { UPCOMING_NOTIFICATION_DELAY_MS } = require('../config');
const nowTimers = {};
const soonTimers = {};

const notificationService = {
  init(channel) {
    const guildUserList = channel.guild.members;
    db.all('SELECT * FROM events', (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        const events = row;
        events.forEach((e) => {
          let notificationRecipientList = [];
          const { id, name, description, date } = e;
          if (date) {
            db.all(`SELECT username FROM users_events WHERE event_id = ${id}`, (err, row) => {
              if (err) {
                console.error(err.message);
              } else {
                const users = row.map(u => u.username);
                const eventDateMS = new Date(date).getTime();
                const currentDateMS = new Date().getTime();
                const eventDescriptor = e.description ? `${e.name} ${e.description}` : e.name;
                if (e.notifications === "yes") {
                  guildUserList.forEach((u) => {
                      if (users.indexOf(u.user.username) !== -1) {
                          notificationRecipientList.push(`<@${u.user.id}>`)
                      }
                  })
                }
                if (eventDateMS > currentDateMS + 300000) {
                  const stringList = notificationRecipientList.join(', ');
                  const timeToSoonNotification = eventDateMS - currentDateMS - UPCOMING_NOTIFICATION_DELAY_MS;
                  const gameStartingSoon = () => {
                    channel.send(`**${eventDescriptor}** is starting in one hour! ${stringList}`);
                  }
                  if (soonTimers[name]) {
                    clearTimeout(soonTimers[name]);
                  }
                  if (timeToSoonNotification > 0) {
                    soonTimers[name] = setTimeout(() => { gameStartingSoon() }, timeToSoonNotification);
                  }
                }
                if (eventDateMS > currentDateMS) {
                  const stringList = notificationRecipientList.join(", ");
                  const timeToNowNotification = eventDateMS - currentDateMS;
                  const gameStartingNow = () => {
                    channel.send(`**${eventDescriptor}** is starting now! ${stringList}`);
                  }
                  if (nowTimers[name]) {
                    clearTimeout(nowTimers[name]);
                  }
                  if (timeToNowNotification > 0) {
                    nowTimers[name] = setTimeout(() => { gameStartingNow() }, timeToNowNotification);
                  }
                }
              }
            });
          }
        });
      }
    });
  }
};

module.exports = notificationService;
