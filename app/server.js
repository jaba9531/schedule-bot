const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('./db/index.js');
const router = require('./router/index.js');

const auth = require("../auth.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  const channel = msg.guild.channels.find(ch => ch.name === 'general');
  router(msg, channel);
});

client.login(auth.token);