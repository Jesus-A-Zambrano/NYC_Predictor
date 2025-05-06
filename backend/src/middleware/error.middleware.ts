import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      // Include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
