import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './core/middleware/requestLogger';
import { errorHandler } from './core/middleware/errorHandler';
import { NotFoundError } from './core/errors/AppError';
import { checkDatabaseConnection } from './core/database/prisma';
import { cacheService } from './core/redis/redis';
import { apiRouter } from './routes/apiRouter';
import { ApiResponse, HealthCheckResponse } from '@finance/types';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins =
    env.CORS_ORIGIN === '*'
      ? '*'
      : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logger
  app.use(requestLogger);

  // Health Check Handler
  const healthCheckHandler = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbStatus = await checkDatabaseConnection();
      const redisStatus = await cacheService.checkHealth();

      const isHealthy = dbStatus.status === 'connected' || env.NODE_ENV === 'development';

      const healthData: HealthCheckResponse = {
        status: isHealthy ? 'healthy' : 'degraded',
        version: '1.0.0',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        services: {
          database: dbStatus,
          redis: redisStatus,
          api: { status: 'up' }
        }
      };

      const response: ApiResponse<HealthCheckResponse> = {
        success: isHealthy,
        message: 'System health check completed',
        data: healthData,
        timestamp: new Date().toISOString()
      };

      res.status(isHealthy ? 200 : 503).json(response);
    } catch (err) {
      next(err);
    }
  };

  // Mount Health Check Endpoints
  app.get('/health', healthCheckHandler);
  app.get('/api/health', healthCheckHandler);
  app.get(`${env.API_PREFIX}/health`, healthCheckHandler);

  // Mount API v1 Routes
  app.use(env.API_PREFIX, apiRouter);

  // Handle 404
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} does not exist on this server`));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

