import { AuthConfig } from '../types';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

export class MiddlewareConfig {
  private static instance: MiddlewareConfig;
  private redis: Redis | null = null;
  private config: AuthConfig;

  private constructor(config: AuthConfig) {
    this.config = config;
  }

  static getInstance(config?: AuthConfig): MiddlewareConfig {
    if (!this.instance && config) {
      this.instance = new MiddlewareConfig(config);
    }
    return this.instance;
  }

  getRedis(): Redis {
    if (!this.redis) {
      this.redis = new Redis(this.config.redisUrl);
      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
      });
    }
    return this.redis;
  }

  getConfig(): AuthConfig {
    return this.config;
  }
} 