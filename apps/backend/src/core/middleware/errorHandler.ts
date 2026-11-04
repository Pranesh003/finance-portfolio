import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@finance/types';
import { AppError } from '../errors/AppError';
import { logger } from '../logger/logger';
import { env } from '../../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error('Unhandled Server Error:', {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  }

  const response: ApiErrorResponse = {
    success: false,
    statusCode,
    message: statusCode >= 500 && env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    errors: err instanceof AppError ? err.errors : undefined
  };

  res.status(statusCode).json(response);
}

