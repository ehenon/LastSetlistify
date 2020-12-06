import winston from 'winston';

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
        winston.format.printf(({ level, message }) => `[${level}]: ${message}`),
      ),
    }),
  ],
});
