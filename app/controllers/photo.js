const express = require('express');
const jwt = require('jsonwebtoken');
const download = require('image-downloader');
const im = require('imagemagick');
const path = require('path');
const fs = require('fs');

const photosPath = `${__dirname}/../../public/images/photos`;
const thumbnailsPath = `${__dirname}/../../public/images/thumbnails`;
const logger = require('../../config/winston');

const { SECRET } = process.env;
const router = express.Router();
let cachedUrl;
let name;

module.exports = (app) => {
  app.use('/thumbnail', router);
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
    return res.status(400).send('Invalid url');
  }
  if (!verifyUrl(url)) {
    return res.status(400).send('Invalid url');
  }
  /* cache the url incase duplicate request */
  if (url === cachedUrl) {
    return fs.readFile(`${thumbnailsPath}/${name}.png`, (err, data) => {
      if (err) {
        return next(err);
      }
      res.set({ 'Content-Type': 'image/png' });
      return res.send(data);
    });
  }

  // verify token
  let user;
  try {
    user = jwt.verify(req.token, SECRET);
  } catch (e) {
    return res.status(401).send('Invalid token');
  }

  // Download image
  let filename;
  try {
    ({ filename } = await download.image({
      url,
      dest: photosPath,
    }));
  } catch (e) {
    return next(
      'an error occured while downloading the image, please try again',
    );
  }

  // Resize operation
  ({ name } = path.parse(filename));
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

      logger.info('thumbnail generated');
      // Remove the downloaded url
      fs.unlink(`${filename}`, (err) => {
        if (err) {
          return logger.info(err);
        }
        logger.info(name, 'removed');
      });

      return fs.readFile(`${thumbnailsPath}/${name}.png`, (err, data) => {
        if (err) {
          return logger.info(err);
        }
        cachedUrl = url;
        res.set({ 'Content-Type': 'image/png' });
        return res.send(data);
      });
    },
  );
});

/**
 * @description - Url validotor
 * @author (Yusuf Adeniyi)
 * @date 2018-08-04
 * @param {string} url
 * @returns - true or false
 */
function verifyUrl(url) {
  const regex = /^(http:\/\/|https:\/\/)(www\.)*[a-zA-Z0-9-/.?_@!#$%^&*()]+\.(jpg|png|webp|gif|jpeg|)$/i;
  return regex.test(url);
}
