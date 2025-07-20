import Redis from 'ioredis';
import { createLogger } from './logger.js';

const logger = createLogger('auth-middleware', 'REDIS');

let redisClient = null;

const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  // Use mock Redis for tests
  if (process.env.NODE_ENV === 'test') {
    const mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK')
    };
    redisClient = mockRedis;
    return redisClient;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    redisClient.on('error', (error) => {
      logger.error('❌ Redis connection error:', error);
    });

    redisClient.on('close', () => {
      logger.info('🔌 Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to create Redis client:', error);
    throw error;
  }
};

const closeRedisConnection = async () => {
  if (redisClient && typeof redisClient.quit === 'function') {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('🔌 Redis connection closed');
    } catch (error) {
      logger.error('❌ Error closing Redis connection:', error);
    }
  }
};

export { getRedisClient, closeRedisConnection }; 