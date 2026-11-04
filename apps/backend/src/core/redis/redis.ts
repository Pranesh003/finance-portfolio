import Redis from 'ioredis';
import { env } from '../../config/env';
import { logger } from '../logger/logger';

class InMemoryCacheFallback {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && typeof duration === 'number') {
      expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

class CacheService {
  private client: Redis | null = null;
  private fallback = new InMemoryCacheFallback();
  private isConnected = false;

  constructor() {
    if (env.REDIS_ENABLED) {
      try {
        this.client = new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD || undefined,
          db: env.REDIS_DB,
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.warn('Redis reconnection limit reached, switching to in-memory fallback.');
              return null;
            }
            return Math.min(times * 200, 2000);
          }
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          logger.info('Connected to Redis service successfully.');
        });

        this.client.on('error', (err) => {
          this.isConnected = false;
          logger.warn('Redis error reported, using in-memory fallback:', { message: err.message });
        });

        this.client.connect().catch(() => {
          logger.info('Redis standalone server not detected. Operating with in-memory cache layer.');
        });
      } catch (err) {
        logger.warn('Could not initialize Redis client, using in-memory cache:', err);
      }
    } else {
      logger.info('Redis disabled by configuration. Operating with in-memory cache layer.');
    }
  }

  public async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return this.fallback.get(key);
      }
    }
    return this.fallback.get(key);
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        await this.fallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
        return;
      }
    }
    await this.fallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  }

  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        await this.fallback.del(key);
        return;
      }
    }
    await this.fallback.del(key);
  }

  public async checkHealth(): Promise<{ status: 'connected' | 'fallback' | 'disconnected'; latencyMs?: number }> {
    if (!this.isConnected || !this.client) {
      return { status: 'fallback' };
    }
    const start = Date.now();
    try {
      await this.client.ping();
      return {
        status: 'connected',
        latencyMs: Date.now() - start
      };
    } catch {
      return { status: 'fallback' };
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}

export const cacheService = new CacheService();

