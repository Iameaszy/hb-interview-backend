const express = require('express');
const glob = require('glob');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const passport = require('passport');
const flash = require('express-flash');
const dotenv = require('dotenv');
const session = require('express-session');

const logger = require('./winston');

const rootDir = `${__dirname}/../`;
module.exports = (app) => {
  // dotenv configuration
  dotenv.config();
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  // app.use(favicon(config.root + '/public/img/favicon.ico'));

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
  app.use(
    session({
      secret: 'secret',
      saveUninitialized: false,
      resave: true,
    }),
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  const controllers = glob.sync(`${rootDir}/app/controllers/*.js`);
  controllers.forEach((controller) => {
    require(controller)(app);
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404
    next(err);
  });

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
  }
  return app;
};
