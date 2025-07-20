const { logger } = require('../utils/logger');
const { getRedisClient } = require('../utils/redis');

const redis = getRedisClient();

const rateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100 // limit each IP to 100 requests per windowMs
} = {}) => {
  return async (req, res, next) => {
    try {
      const key = `ratelimit:${req.ip}`;
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      if (current > max) {
        logger.warn('Rate limit exceeded', { ip: req.ip });
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: windowMs / 1000
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next(); // Fail open to prevent blocking all requests if Redis is down
    }
  };
};

module.exports = { rateLimiter }; 