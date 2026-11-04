import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets: Map<string, RateLimitRecord> = new Map();

/**
 * Creates an in-memory sliding window rate limiter middleware.
 * @param windowMs Time window in milliseconds (default 60000ms = 1 min)
 * @param maxRequests Maximum requests allowed per IP within the window
 * @param message Custom error message
 */
export function createRateLimiter(
  windowMs = 60000,
  maxRequests = 15,
  message = 'Too many authentication attempts. Please wait before retrying.'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rawIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const firstPart = rawIp.split(',')[0];
    const clientIp = (firstPart || '127.0.0.1').trim();
    const now = Date.now();

    const record = ipBuckets.get(clientIp);

    if (!record || now > record.resetAt) {
      ipBuckets.set(clientIp, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      logger.warn(`[RATE LIMIT] IP ${clientIp} exceeded auth rate limit of ${maxRequests} req/${windowMs}ms`);

      res.status(429).json({
        success: false,
        statusCode: 429,
        error: 'Too Many Requests',
        message,
        retryAfter: retryAfterSec
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter(60000, 20);
export const strictAuthRateLimiter = createRateLimiter(60000, 10, 'Too many login attempts. Account protection active.');
