const jwt = require('jsonwebtoken');
const { createLogger } = require('./logger');
const { getRedisClient } = require('./redis');

const logger = createLogger('auth-middleware', 'TOKEN');

class TokenManager {
  static ACCESS_TOKEN_EXPIRY = '15m';
  static REFRESH_TOKEN_EXPIRY = '7d';

  static generateTokenPair(payload) {
    try {
      logger.info('🔑 Generating new token pair', { 
        userId: payload.userId,
        roles: payload.roles 
      });

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          algorithm: 'HS512',
          expiresIn: this.ACCESS_TOKEN_EXPIRY,
          audience: process.env.JWT_AUDIENCE || 'dev-server',
          issuer: process.env.JWT_ISSUER || 'auth-middleware'
        }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
          algorithm: 'HS512',
          expiresIn: this.REFRESH_TOKEN_EXPIRY,
          audience: process.env.JWT_AUDIENCE || 'dev-server',
          issuer: process.env.JWT_ISSUER || 'auth-middleware'
        }
      );

      // Only store in Redis if not in test environment
      if (process.env.NODE_ENV !== 'test') {
        this._storeRefreshToken(payload.userId, refreshToken);
      }

      logger.info('✨ Tokens generated successfully', {
        userId: payload.userId,
        accessTokenExp: '15m',
        refreshTokenExp: '7d'
      });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('❌ Token generation failed:', error);
      throw error;
    }
  }

  static async _storeRefreshToken(userId, refreshToken) {
    try {
      const redis = getRedisClient();
      await redis.setex(
        `refresh:${userId}`,
        7 * 24 * 60 * 60, // 7 days
        refreshToken
      );
    } catch (error) {
      logger.error('Failed to store refresh token in Redis:', error);
    }
  }

  static async revokeUserTokens(userId) {
    logger.info('🔒 Revoking tokens for user', { userId });
    try {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      
      const redis = getRedisClient();
      // Get stored refresh token
      const refreshToken = await redis.get(`refresh:${userId}`);
      if (refreshToken) {
        // Add to blacklist
        await redis.setex(
          `blacklist:${refreshToken}`,
          7 * 24 * 60 * 60,
          'revoked'
        );
        // Remove from active tokens
        await redis.del(`refresh:${userId}`);
      }
      
      logger.info('User tokens revoked', { userId });
      return true;
    } catch (error) {
      logger.error('Token revocation failed:', error);
      return false;
    }
  }

  static async isTokenBlacklisted(token) {
    try {
      if (process.env.NODE_ENV === 'test') {
        return false;
      }
      
      const redis = getRedisClient();
      const blacklisted = await redis.get(`blacklist:${token}`);
      return !!blacklisted;
    } catch (error) {
      logger.error('Blacklist check failed:', error);
      return true; // Fail secure
    }
  }
}

module.exports = { TokenManager }; 