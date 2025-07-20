const { validateToken, refreshToken } = require('../utils/tokenValidator');
const { createLogger } = require('../utils/logger');
const { cookieConfig } = require('../utils/cookieConfig');

const logger = createLogger('auth-middleware', 'AUTH');

const authenticate = async (req, res, next) => {
  try {
    logger.info('🔍 Authenticating request', { 
      path: req.path,
      method: req.method 
    });

    // Check for access token in cookies first, then header
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    logger.info('🔍 Token extraction', {
      hasCookies: !!req.cookies.accessToken,
      hasAuthHeader: !!req.headers.authorization,
      extractedToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'none'
    });
    
    if (!accessToken) {
      logger.warn('⚠️ No access token found, trying refresh token');
      // Try refresh token if access token is missing
      const refreshTokenValue = req.cookies.refreshToken;
      if (refreshTokenValue) {
        const newAccessToken = await refreshToken(refreshTokenValue);
        if (newAccessToken) {
          res.cookie('accessToken', newAccessToken, cookieConfig.accessToken);
          
          const decoded = await validateToken(newAccessToken);
          if (decoded) {
            req.user = {
              id: decoded.userId,
              email: decoded.email,
              roles: decoded.roles,
              permissions: decoded.permissions
            };
            logger.info('✅ Authentication successful', {
              userId: decoded.userId,
              roles: decoded.roles
            });
            return next();
          }
        }
      }
      
      logger.warn('Authentication failed: No valid token');
      return res.status(401).json({ error: 'Please login to continue' });
    }

    const decoded = await validateToken(accessToken);
    logger.info('Token validation result:', { hasDecoded: !!decoded, userId: decoded?.userId });
    if (!decoded) {
      logger.warn('Authentication failed: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
      permissions: decoded.permissions
    };

    logger.info('✅ Authentication successful', {
      userId: decoded.userId,
      roles: decoded.roles
    });

    next();
  } catch (error) {
    logger.error('❌ Authentication failed:', error.message);
    logger.error('❌ Authentication error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticate }; 