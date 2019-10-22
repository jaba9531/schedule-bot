const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // App
  UPCOMING_NOTIFICATION_DELAY_MS: 300000,

  // Env
  SERVER_NAME: process.env.SERVER_NAME,
  CHANNEL_NAME: process.env.CHANNEL_NAME,
};
