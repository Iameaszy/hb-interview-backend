const express = require('express');
const jwt = require('jsonwebtoken');
const jsonPatch = require('jsonpatch');

const { SECRET } = process.env;
const router = express.Router();

module.exports = (app) => {
  app.use('/', router);
};
router.post('/login', (req, res) => {
  /**
   *@prop {username} - The username of the client
   *@prop {password} - The password of the client
   */
  const { username, password } = req.body;

  // if the username or password is invalid, return 400 status code
  if (!username || !password) {
    return res.status(400).send('Invalid username or password');
  }

  // generate token from client information
  const token = jwt.sign({ username, password }, SECRET);
  // return the token to the user
  res.json({ token });
});

router.post('/patch', authenticate, (req, res, next) => {
  // verify client token
  let user;
  try {
    user = jwt.verify(req.token, SECRET);
  } catch (e) {
    return res.status(401).send('Invalid token');
  }

  const { data, patch } = req.body;

  if (!data || !patch) {
    return res.status(400).send('invalid data or patch');
  }

  try {
    const patched = jsonPatch.apply_patch(data, patch);
    return res.send(patched);
  } catch (e) {
    return res.status(400).send('Invalid patch values');
  }
});
/**
 *Token validator
 * @param {httpRequest} req
 * @param {httpResponse} res
 * @param {errorHandler} next
 */
function authenticate(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorised Access');
  }
  req.token = req.headers.authorization;
  next();
}
