const Redis = require('ioredis');
const { createLogger } = require('./logger');

const logger = createLogger('auth-middleware', 'REDIS');

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    const options = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true // Don't connect immediately
    };

    redisClient = new Redis(options);
    
    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  return redisClient;
};

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

module.exports = { 
  getRedisClient, 
  closeRedisConnection 
}; 