const { addUser, removeUser, addDate, getInfo } = require('../controller/index.js');
const { checkDate } = itemValidators = require("../utils/validation/index.js");

const messageRouter = function messageRouter(msg, channel) {
  const splitMsg = msg.content.split(" ");
  const firstLetter = msg.content.charAt(0);
  const firstWord = splitMsg[0].substr(1);
  const secondWord = splitMsg[1];
  const thirdWord = splitMsg[2];
  let eventName;
  if (firstLetter === '!') {
    switch(true) {
      case (firstWord === 'schedule') :
        eventName = msg.content.substr(firstWord.length + 2);
        scheduleEvent(eventName, channel);
        break;

      case (secondWord === 'add' || secondWord === 'remove'):
        eventName = firstWord;
        const user = thirdWord;
        let userId;
        if (user.substr(0, 2) === '<@' && user.substr(user.length - 1 === ">")) {
          userId = user.substr(2, user.length - 3);
        }
        const username = msg.guild.members.get(userId).user.username;
        secondWord === 'add' ? addUser(username, eventName, channel) : removeUser(username, eventName, channel);
        break;

      case (secondWord === 'date') :
        const date = msg.content.substr(secondWord.length + firstWord.length + 3);
        eventName = firstWord;
        checkDate(date, (result) => { 
          if (result) {
            addDate(eventName, channel, date);
          } else {
            channel.send(':x: invalid date, please use this format: **mm[/.-]dd[/.-]yyyy hh:mm:ss am|pm**');
          }
        });
        break;
      
      case (secondWord === 'info') :
        eventName = firstWord;
        getInfo(eventName, channel);
        break;

      default:
        channel.send(':x: command not recognized');
        break;
    }
  }
};

module.exports = messageRouter;