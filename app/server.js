const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('./db/index.js');
const router = require('./router/index.js');
const notificationService = require('./services/notificationService.js');
const auth = require("../auth.json");
const { SERVER_NAME, CHANNEL_NAME } = require("./config");
let channel;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  channel = client.guilds.find(g => g.name === SERVER_NAME).channels.find(ch => ch.name === CHANNEL_NAME);
  notificationService.init(channel);
});

client.on('message', msg => {
  router(msg, channel);
});

client.login(auth.token);