const winston = require('winston');

const consoleOptions = {
  level: 'debug',
  handleExceptions: true,
  json: true,
  colorize: true,
};

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(consoleOptions),
  ],
});

logger.stream = {
  write: (message) => {
    logger.debug(message);
  },
};

module.exports = { logger };
