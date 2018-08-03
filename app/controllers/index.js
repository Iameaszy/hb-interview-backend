const express = require('express');
const jwt = require('jsonwebtoken');

const { SECRET } = process.env;
const router = express.Router();

module.exports = (app) => {
  app.use('/', router);
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send('Invalid username or password');
  }
  const token = jwt.sign({ username, password }, SECRET);
  res.json({ token });
});
