import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../logger/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' }
    ]
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<{
  status: 'connected' | 'disconnected';
  latencyMs?: number;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'connected',
      latencyMs: Date.now() - start
    };
  } catch (error) {
    logger.warn('Database health check ping failed (expected if local PostgreSQL is not started yet):', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      status: 'disconnected'
    };
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed gracefully.');
  } catch (err) {
    logger.error('Error during database disconnect:', err);
  }
}

