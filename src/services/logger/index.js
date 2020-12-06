import winston from 'winston';

/**
 * Function to custom our own log printer and being able to create our own winston custom format.
 * @param {object} obj - An object of parameters.
 * @param {string} obj.level - Log level (debug|info|warn|error).
 * @param {string} obj.message - Log message.
 * @returns {string} Log as string.
 */
const customLogPrinter = ({ level, message }) => `[${level}]: ${message}`;

export default winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format((log) => {
          const { level, ...otherProps } = log;
          const info = { level: level.toUpperCase(), ...otherProps };
          return info;
        })(),
        winston.format.colorize(),
        winston.format.printf(customLogPrinter),
      ),
    }),
  ],
});
