const Redis = require('ioredis');
const { logger } = require('./logger');

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    const options = {
      host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
      port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Retrying Redis connection in ${delay}ms`);
        return delay;
      }
    };

    redisClient = new Redis(options);
    
    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });
  }
  
  return redisClient;
};

module.exports = { getRedisClient }; 