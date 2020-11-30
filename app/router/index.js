const { addUser, removeUser, addDate, getInfo, scheduleEvent, toggleNotifications, help, deleteEvent, addEventDescription, displayCalendar, saySup } = require('../controller/index.js');
const { checkDate } = itemValidators = require("../utils/validation/index.js");
const { CHANNEL_NAME } = require("../config");

const messageRouter = async function messageRouter(msg, channel) {
  const splitMsg = msg.content.split(" ");
  const firstLetter = msg.content.charAt(0);
  const firstWord = splitMsg[0].substr(1);
  const secondWord = splitMsg[1];
  const thirdWord = splitMsg[2];
  let guild;
  let description;
  let eventName;
  if (secondWord === 'add' || secondWord === 'remove') {
    guild = await msg.guild.fetchMembers();
  }
  if (firstLetter === '!' && msg.channel.name === CHANNEL_NAME) {
    switch(true) {
      // Check Pulse
      case (firstWord === "sup") :
        saySup(channel);
        break;

      // Display Calendar
      case (firstWord === "calendar") :
        displayCalendar(channel);
        break;

      // Schedule New Event
      case (firstWord === 'schedule') :
        description = '';
        eventName = msg.content.substr(firstWord.length + 2);
        if (!secondWord) {
          channel.send('Please enter an event name');
          break;
        }
        if (thirdWord) {
          eventName = msg.content.substr(firstWord.length + 2, secondWord.length);
          description = msg.content.substr(firstWord.length + secondWord.length + 3);
        }
        scheduleEvent(eventName, description, channel);
        break;

      // Get Help Commands
      case (firstWord === 'help') :
        help(channel);
        break;

      // Add/Remove User From Event
      case (secondWord === 'add' || secondWord === 'remove'):
        eventName = firstWord;
        const user = thirdWord;
        let userId;
        if (!user) {
          channel.send('Please specify a user');
          break;
        }
        if (user.substr(0, 2) === '<@' && user.substr(user.length - 1 === ">")) {
          userId = user.substr(2, user.length - 3);
        }
        if (!userId) {
          channel.send(':x: User not found');
          break;
        }
        if (!guild.members.get(userId.slice(1))) {
          channel.send(':x: User not found');
          break;
        }
        const username = guild.members.get(userId.slice(1)).user.username;
        secondWord === 'add' ? addUser(username, eventName, channel) : removeUser(username, eventName, channel);
        break;

      // Add Date To Event
      case (secondWord === 'date') :
        const date = msg.content.substr(secondWord.length + firstWord.length + 3);
        eventName = firstWord;
        checkDate(date, (result) => { 
          if (result) {
            addDate(eventName, channel, date);
          } else {
            channel.send(':x: invalid date, please use this format in PST: **mm[/.-]dd[/.-]yyyy hh:mm:ss am|pm**');
          }
        });
        break;
      
      // Get Event Info
      case (secondWord === 'info') :
        eventName = firstWord;
        getInfo(eventName, channel);
        break;

      // Toggle Event Notifications
      // Consider getting rid of this feature
      // case (secondWord === 'toggle_notifications') :
      //   eventName = firstWord;
      //   toggleNotifications(eventName, channel);
      //   break;

      // Add Event Description
      case (secondWord === 'description') :
        eventName = firstWord;
        if (!thirdWord) {
          channel.send('Please enter a valid event description');
          break;
        }
        description = msg.content.substr(firstWord.length + secondWord.length + 3);
        addEventDescription(eventName, description, channel);
        break;

      // Remove Event
      case (secondWord === 'cancel'):
        eventName = firstWord;
        deleteEvent(eventName, channel);
        break;

      default:
        channel.send(':x: command not recognized');
        break;
    }
  }
};

module.exports = messageRouter;