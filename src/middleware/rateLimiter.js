import { createLogger } from '../utils/logger.js';
import { getRedisClient } from '../utils/redis.js';

const logger = createLogger('auth-middleware', 'RATE_LIMIT');

// Get Redis client lazily to avoid issues in test environment
const getRedis = () => getRedisClient();

const rateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100 // limit each IP to 100 requests per windowMs
} = {}) => {
  return async (req, res, next) => {
    try {
      // SUPER PROMINENT RATE LIMITER INVOCATION LOG
      console.log('\n' + '='.repeat(80));
      console.log('🚨🚨🚨 RATE LIMITER MIDDLEWARE INVOKED 🚨🚨🚨');
      console.log('🚫 RATE LIMITING MIDDLEWARE EXECUTING');
      console.log('📍 Path:', req.path);
      console.log('📋 Method:', req.method);
      console.log('🌐 IP:', req.ip);
      console.log('⏰ Time:', new Date().toISOString());
      console.log('='.repeat(80) + '\n');
      
      logger.info('🚨🚨🚨 RATE LIMITER MIDDLEWARE INVOKED 🚨🚨🚨', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        windowMs,
        max,
        timestamp: new Date().toISOString(),
        middlewareType: 'RATE_LIMITER',
        service: 'auth-middleware'
      });
      
      const redis = getRedis();
      const key = `ratelimit:${req.ip}`;
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      if (current > max) {
        // SUPER PROMINENT RATE LIMIT EXCEEDED LOG
        console.log('\n' + '🚫'.repeat(20));
        console.log('🚫🚫🚫 RATE LIMIT EXCEEDED 🚫🚫🚫');
        console.log('🚫 IP:', req.ip);
        console.log('🚫 Current:', current);
        console.log('🚫 Max:', max);
        console.log('🚫'.repeat(20) + '\n');
        
        logger.warn('🚫🚫🚫 RATE LIMIT EXCEEDED 🚫🚫🚫', {
          ip: req.ip,
          current,
          max,
          windowMs,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString(),
          middlewareType: 'RATE_LIMIT_EXCEEDED',
          service: 'auth-middleware'
        });
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: windowMs / 1000
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      // SUPER PROMINENT RATE LIMIT SUCCESS LOG
      console.log('\n' + '✅'.repeat(20));
      console.log('✅✅✅ RATE LIMIT CHECK PASSED ✅✅✅');
      console.log('✅ IP:', req.ip);
      console.log('✅ Current:', current);
      console.log('✅ Remaining:', Math.max(0, max - current));
      console.log('✅'.repeat(20) + '\n');
      
      logger.info('✅✅✅ RATE LIMIT CHECK PASSED ✅✅✅', {
        ip: req.ip,
        current,
        remaining: Math.max(0, max - current),
        max,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        middlewareType: 'RATE_LIMIT_SUCCESS',
        service: 'auth-middleware'
      });

      next();
    } catch (error) {
      // SUPER PROMINENT RATE LIMIT ERROR LOG
      console.log('\n' + '💥'.repeat(20));
      console.log('💥💥💥 RATE LIMITER ERROR 💥💥💥');
      console.log('💥 Error:', error.message);
      console.log('💥 Stack:', error.stack);
      console.log('💥'.repeat(20) + '\n');
      
      logger.error('💥💥💥 RATE LIMITER ERROR 💥💥💥', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'RATE_LIMITER_ERROR',
        service: 'auth-middleware'
      });
      next(); // Fail open to prevent blocking all requests if Redis is down
    }
  };
};

export { rateLimiter }; 