import jwt from 'jsonwebtoken';
import { createLogger } from './logger.js';
import { getRedisClient } from './redis.js';

const logger = createLogger('auth-middleware', 'TOKEN');

const validateToken = async (token) => {
  try {
    logger.info('🔍 Validating token');
    
    // Get Redis client lazily
    const redis = getRedisClient();
    
    // Check cache
    const cachedToken = await redis.get(`token:${token}`);
    if (cachedToken) {
      logger.info('💾 Using cached token validation');
      return JSON.parse(cachedToken);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS512'],
      audience: process.env.JWT_AUDIENCE || 'dev-server',
      issuer: process.env.JWT_ISSUER || 'auth-middleware'
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
    logger.error('❌ Token validation failed:', error.message);
    logger.error('❌ Token validation error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS512'],
      audience: process.env.JWT_AUDIENCE || 'dev-server',
      issuer: process.env.JWT_ISSUER || 'auth-middleware'
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
        audience: process.env.JWT_AUDIENCE || 'dev-server',
        issuer: process.env.JWT_ISSUER || 'auth-middleware'
      }
    );

    return accessToken;
  } catch (error) {
    logger.error('Refresh token validation failed', error);
    return null;
  }
};

export { validateToken, refreshToken }; 