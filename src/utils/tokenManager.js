const jwt = require('jsonwebtoken');
const { logger } = require('./logger');
const { getRedisClient } = require('./redis');

const redis = getRedisClient();

class TokenManager {
  static ACCESS_TOKEN_EXPIRY = '15m';
  static REFRESH_TOKEN_EXPIRY = '7d';

  static async generateTokenPair(payload) {
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
          audience: process.env.JWT_AUDIENCE || 'mememe',
          issuer: process.env.JWT_ISSUER || 'mememe'
        }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
          algorithm: 'HS512',
          expiresIn: this.REFRESH_TOKEN_EXPIRY,
          audience: process.env.JWT_AUDIENCE || 'mememe',
          issuer: process.env.JWT_ISSUER || 'mememe'
        }
      );

      // Store refresh token in Redis for tracking
      await redis.setex(
        `refresh:${payload.userId}`,
        7 * 24 * 60 * 60, // 7 days
        refreshToken
      );

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

  static async revokeUserTokens(userId) {
    logger.info('🔒 Revoking tokens for user', { userId });
    try {
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
      const blacklisted = await redis.get(`blacklist:${token}`);
      return !!blacklisted;
    } catch (error) {
      logger.error('Blacklist check failed:', error);
      return true; // Fail secure
    }
  }
}

module.exports = { TokenManager }; 