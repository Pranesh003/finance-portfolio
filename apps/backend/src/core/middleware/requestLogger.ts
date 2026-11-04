import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';
import { env } from '../../config/env';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!env.ENABLE_REQUEST_LOGGING) {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms (${ip})`;

    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
}

