const express = require('express');

const app = express();
const logger = require('./config/winston');

require('dotenv').config();

require('./config/express')(app);

const server = app.listen(3000, () => {
  logger.info(`Express server listening on port ${3000}`);
});

module.exports = {
  server,
  app,
};
