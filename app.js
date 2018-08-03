const express = require('express');

const app = express();
require('dotenv').config();
require('./config/express')(app);

const server = app.listen(3000, () => {
  console.log(`Express server listening on port ${3000}`);
});

module.exports = {
  server,
  app,
};
