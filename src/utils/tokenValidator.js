const jwt = require('jsonwebtoken');
const { logger } = require('./logger');
const { getRedisClient } = require('./redis');

const redis = getRedisClient();

const validateToken = async (token) => {
  try {
    logger.info('🔍 Validating token');
    
    // Check cache
    const cachedToken = await redis.get(`token:${token}`);
    if (cachedToken) {
      logger.info('💾 Using cached token validation');
      return JSON.parse(cachedToken);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS512'],
      audience: process.env.JWT_AUDIENCE || 'mememe',
      issuer: process.env.JWT_ISSUER || 'mememe'
    });
    
    logger.info('✅ Token validated successfully', {
      userId: decoded.userId,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    // Cache token if it's valid
    if (decoded.exp && decoded.exp > Date.now() / 1000) {
      await redis.setex(
        `token:${token}`,
        decoded.exp - Math.floor(Date.now() / 1000),
        JSON.stringify(decoded)
      );
    }

    return decoded;
  } catch (error) {
    logger.error('❌ Token validation failed:', error);
    return null;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS512'],
      audience: process.env.JWT_AUDIENCE || 'mememe',
      issuer: process.env.JWT_ISSUER || 'mememe'
    });

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
        permissions: decoded.permissions
      },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS512',
        expiresIn: '15m',
        audience: process.env.JWT_AUDIENCE || 'mememe',
        issuer: process.env.JWT_ISSUER || 'mememe'
      }
    );

    return accessToken;
  } catch (error) {
    logger.error('Refresh token validation failed', error);
    return null;
  }
};

module.exports = { validateToken, refreshToken }; 