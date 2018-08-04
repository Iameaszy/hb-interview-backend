const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `${__dirname}/../logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFile: 5,
    colorize: false,
  },
  console: {
    format: winston.format.simple(),
  },
};

const logger = winston.createLogger({
  transports: [new winston.transports.File(options.file)],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.console));
}
logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  },
};
module.exports = logger;
