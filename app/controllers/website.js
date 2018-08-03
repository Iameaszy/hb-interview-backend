const express = require('express');
const jwt = require('jsonwebtoken');
const download = require('image-downloader');
const im = require('imagemagick');
const path = require('path');
const fs = require('fs');

const photosPath = `${__dirname}/../../public/images/photos`;
const thumbnailsPath = `${__dirname}/../../public/images/thumbnails`;
const { SECRET } = process.env;
const router = express.Router();
let cachedUrl;
let name;

module.exports = (app) => {
  app.use('/photo', router);
};
router.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorised Access');
  }
  req.token = req.headers.authorization;
  next();
});

router.post('/create', async (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).end('Invalid url');
  }
  if (!verifyUrl(url)) {
    return res.status(400).send('Invalid url');
  }
  let user;
  /* cache the url incase duplicate request */
  if (url === cachedUrl) {
    return fs.readFile(`${thumbnailsPath}/${name}.png`, (err, data) => {
      if (err) {
        return console.log(err);
      }
      res.set({ 'Content-Type': 'image/png' });
      return res.send(data);
    });
  }
  cachedUrl = url;

  // verify token
  try {
    user = jwt.verify(req.token, SECRET);
  } catch (e) {
    next(e);
  }
  if (!user) {
    res.status(401).send('Unauthorised Access');
  }
  let filename;
  // Download image
  try {
    ({ filename } = await download.image({
      url,
      dest: photosPath,
    }));
  } catch (e) {
    return res
      .status(500)
      .send('an error occured while downloading the image, please try again');
  }

  ({ name } = path.parse(filename));
  // Resize operation
  im.resize(
    {
      srcPath: filename,
      dstPath: `${thumbnailsPath}/${name}.png`,
      width: 50,
      height: 50,
    },
    (err) => {
      if (err) {
        return next(err);
      }

      console.log('thumbnail generated');
      // Remove the downloaded url
      fs.unlink(`${filename}`, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(name, ' removed');
      });

      fs.readFile(`${thumbnailsPath}/${name}.png`, (err, data) => {
        if (err) {
          return console.log(err);
        }
        res.set({ 'Content-Type': 'image/png' });
        res.send(data);
      });
    },
  );
});

function verifyUrl(url) {
  const regex = /^(http:\/\/|https:\/\/)(www\.)*[a-zA-Z0-9-/.?_@!#$%^&*()]+.(jpg|png|webp|gif|jpeg|)$/i;
  return regex.test(url);
}
