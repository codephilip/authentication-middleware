import { validateToken, refreshToken } from '../utils/tokenValidator.js';
import { createLogger } from '../utils/logger.js';
import { cookieConfig } from '../utils/cookieConfig.js';

const logger = createLogger('auth-middleware', 'AUTH');

const authenticate = async (req, res, next) => {
  try {
    // SUPER PROMINENT AUTH MIDDLEWARE INVOCATION LOG
    console.log('\n' + '='.repeat(80));
    console.log('🚨🚨🚨 AUTH MIDDLEWARE INVOKED 🚨🚨🚨');
    console.log('🔐 AUTHENTICATION MIDDLEWARE EXECUTING');
    console.log('📍 Path:', req.path);
    console.log('📋 Method:', req.method);
    console.log('🌐 IP:', req.ip);
    console.log('⏰ Time:', new Date().toISOString());
    console.log('='.repeat(80) + '\n');
    
    logger.info('🚨🚨🚨 AUTH MIDDLEWARE INVOKED 🚨🚨🚨', { 
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      middlewareType: 'AUTHENTICATION',
      service: 'auth-middleware'
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
                // SUPER PROMINENT AUTH SUCCESS LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('🎉🎉🎉 AUTHENTICATION SUCCESSFUL 🎉🎉🎉');
    console.log('👤 User ID:', decoded.userId);
    console.log('🎭 Roles:', decoded.roles);
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('🎉🎉🎉 AUTHENTICATION SUCCESSFUL 🎉🎉🎉', {
      userId: decoded.userId,
      roles: decoded.roles,
      email: decoded.email,
      permissions: decoded.permissions,
      timestamp: new Date().toISOString(),
      middlewareType: 'AUTHENTICATION_SUCCESS',
      service: 'auth-middleware'
    });
            return next();
          }
        }
      }
      
      // SUPER PROMINENT AUTH FAILURE LOG
      console.log('\n' + '❌'.repeat(20));
      console.log('🚫🚫🚫 AUTHENTICATION FAILED 🚫🚫🚫');
      console.log('❌ Reason: No valid token');
      console.log('❌'.repeat(20) + '\n');
      
      logger.warn('🚫🚫🚫 AUTHENTICATION FAILED 🚫🚫🚫', {
        reason: 'No valid token',
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'AUTHENTICATION_FAILURE',
        service: 'auth-middleware'
      });
      return res.status(401).json({ error: 'Please login to continue' });
    }

    const decoded = await validateToken(accessToken);
    logger.info('Token validation result:', { hasDecoded: !!decoded, userId: decoded?.userId });
    if (!decoded) {
      // SUPER PROMINENT AUTH FAILURE LOG
      console.log('\n' + '❌'.repeat(20));
      console.log('🚫🚫🚫 AUTHENTICATION FAILED 🚫🚫🚫');
      console.log('❌ Reason: Invalid token');
      console.log('❌'.repeat(20) + '\n');
      
      logger.warn('🚫🚫🚫 AUTHENTICATION FAILED 🚫🚫🚫', {
        reason: 'Invalid token',
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'AUTHENTICATION_FAILURE',
        service: 'auth-middleware'
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
      permissions: decoded.permissions
    };

    // SUPER PROMINENT AUTH SUCCESS LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('🎉🎉🎉 AUTHENTICATION SUCCESSFUL 🎉🎉🎉');
    console.log('👤 User ID:', decoded.userId);
    console.log('🎭 Roles:', decoded.roles);
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('🎉🎉🎉 AUTHENTICATION SUCCESSFUL 🎉🎉🎉', {
      userId: decoded.userId,
      roles: decoded.roles,
      email: decoded.email,
      permissions: decoded.permissions,
      timestamp: new Date().toISOString(),
      middlewareType: 'AUTHENTICATION_SUCCESS',
      service: 'auth-middleware'
    });

    next();
  } catch (error) {
    // SUPER PROMINENT AUTH ERROR LOG
    console.log('\n' + '💥'.repeat(20));
    console.log('💥💥💥 AUTHENTICATION ERROR 💥💥💥');
    console.log('💥 Error:', error.message);
    console.log('💥 Stack:', error.stack);
    console.log('💥'.repeat(20) + '\n');
    
    logger.error('💥💥💥 AUTHENTICATION ERROR 💥💥💥', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'AUTHENTICATION_ERROR',
      service: 'auth-middleware'
    });
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export { authenticate }; 