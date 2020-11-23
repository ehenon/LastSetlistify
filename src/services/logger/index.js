const winston = require('winston');

module.exports = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => `[${level}]: ${message}`),
      ),
    }),
  ],
});
