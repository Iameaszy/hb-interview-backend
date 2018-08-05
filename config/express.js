const express = require('express');
const glob = require('glob');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const dotenv = require('dotenv');
const raven = require('raven');

const logger = require('./winston');

const rootDir = `${__dirname}/../`;
module.exports = (app) => {
  // Error monitoring configuration
  raven.config('__DSN__').install();
  // dotenv configuration
  dotenv.config();
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  // app.use(favicon(config.root + '/public/img/favicon.ico'));

  app.use(raven.requestHandler());
  app.use(morgan('combined', { stream: logger.stream }));
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(`${rootDir}/public`));
  app.use(methodOverride());
  app.use(
    cors({
      origin: 'http://localhost:3001',
    }),
  );
  const controllers = glob.sync(`${rootDir}/app/controllers/*.js`);
  controllers.forEach((controller) => {
    require(controller)(app);
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(raven.errorHandler());
  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      logger.error(
        `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
          req.method
        } - ${req.ip}`,
      );
      res.status(err.status || 500);
      res.end(err.message);
    });
  } else if (app.get('env') === 'production') {
    app.use((err, req, res, next) => {
      logger.error(
        `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
          req.method
        } - ${req.ip}`,
      );
      res.end();
    });
  }
  return app;
};
