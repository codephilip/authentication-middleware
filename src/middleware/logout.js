const { createLogger } = require('../utils/logger');
const { TokenManager } = require('../utils/tokenManager');
const { cookieConfig } = require('../utils/cookieConfig');
const { getRedisClient } = require('../utils/redis');

const logger = createLogger('auth-middleware', 'LOGOUT');

const redis = getRedisClient();

const logout = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;

    // Blacklist tokens
    if (accessToken) {
      await redis.setex(`blacklist:${accessToken}`, 15 * 60, 'true'); // 15 minutes
    }
    if (refreshToken) {
      await redis.setex(`blacklist:${refreshToken}`, 7 * 24 * 60 * 60, 'true'); // 7 days
    }

    // Clear cookies
    res.clearCookie('accessToken', cookieConfig.accessToken);
    res.clearCookie('refreshToken', cookieConfig.refreshToken);

    logger.info('User logged out successfully', { userId: req.user?.id });
    
    next();
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

module.exports = { logout }; 