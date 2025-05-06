import { createLogger, transports, format } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export const setupLogger = () => {
  const logger = createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
      timestamp(),
      logFormat
    ),
    transports: [
      new transports.Console(),
      // Add other transports like File or DailyRotateFile in production
    ],
  });

  return logger;
};

// Export a default logger instance for easy access elsewhere
export const logger = setupLogger();
