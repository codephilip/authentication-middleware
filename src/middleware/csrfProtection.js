const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { getRedisClient } = require('../utils/redis');

const redis = getRedisClient();

const csrfProtection = async (req, res, next) => {
  if (req.method === 'GET') {
    // Generate new CSRF token for GET requests
    const csrfToken = uuidv4();
    await redis.setex(`csrf:${csrfToken}`, 24 * 60 * 60, 'valid'); // 24 hours
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    next();
  } else {
    // Validate CSRF token for non-GET requests
    const csrfToken = req.headers['x-xsrf-token'] || req.body._csrf;
    const isValid = await redis.get(`csrf:${csrfToken}`);
    
    if (!isValid) {
      logger.warn('CSRF validation failed', {
        token: csrfToken,
        method: req.method,
        path: req.path
      });
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    next();
  }
};

module.exports = { csrfProtection }; 