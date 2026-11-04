import { createApp } from './app';
import { env } from './config/env';
import { logger } from './core/logger/logger';
import { disconnectDatabase } from './core/database/prisma';
import { cacheService } from './core/redis/redis';
import http from 'http';

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(`===========================================================`);
  logger.info(`🚀 ${env.APP_NAME} Backend API Started`);
  logger.info(`🌐 Environment : ${env.NODE_ENV}`);
  logger.info(`📡 Server URL  : http://${env.HOST}:${env.PORT}`);
  logger.info(`🩺 Health Check: http://${env.HOST}:${env.PORT}/api/health`);
  logger.info(`🔌 API Base    : http://${env.HOST}:${env.PORT}${env.API_PREFIX}`);
  logger.info(`===========================================================`);
});

// Graceful Shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await disconnectDatabase();
      await cacheService.disconnect();
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown cleanups:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

