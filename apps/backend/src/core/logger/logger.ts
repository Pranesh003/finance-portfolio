import winston from 'winston';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const customDevFormat = printf(({ level, message, timestamp: time, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${time}] ${level}: ${stack || message}${metaString}`;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.NODE_ENV === 'production' ? json() : combine(colorize(), customDevFormat)
  ),
  defaultMeta: { service: 'finance-backend' },
  transports: [
    new winston.transports.Console()
  ]
});

