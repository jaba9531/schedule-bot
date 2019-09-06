const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('./db/index.js');

const auth = require("../auth.json");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
    if (msg.content === 'schedule') {
        db.run('CREATE TABLE test-table');
        msg.react('🔥');
    }
});

client.login(auth.token);