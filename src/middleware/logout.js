import { createLogger } from '../utils/logger.js';
import { TokenManager } from '../utils/tokenManager.js';
import { cookieConfig } from '../utils/cookieConfig.js';
import { getRedisClient } from '../utils/redis.js';

const logger = createLogger('auth-middleware', 'LOGOUT');

const redis = getRedisClient();

const logout = async (req, res, next) => {
  try {
    // SUPER PROMINENT LOGOUT MIDDLEWARE INVOCATION LOG
    console.log('\n' + '='.repeat(80));
    console.log('🚨🚨🚨 LOGOUT MIDDLEWARE INVOKED 🚨🚨🚨');
    console.log('🚪 LOGOUT MIDDLEWARE EXECUTING');
    console.log('📍 Path:', req.path);
    console.log('📋 Method:', req.method);
    console.log('👤 User:', req.user?.id || 'NO USER');
    console.log('🌐 IP:', req.ip);
    console.log('⏰ Time:', new Date().toISOString());
    console.log('='.repeat(80) + '\n');
    
    logger.info('🚨🚨🚨 LOGOUT MIDDLEWARE INVOKED 🚨🚨🚨', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'LOGOUT',
      service: 'auth-middleware'
    });
    
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

    // SUPER PROMINENT LOGOUT SUCCESS LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('🎉🎉🎉 LOGOUT SUCCESSFUL 🎉🎉🎉');
    console.log('👤 User:', req.user?.id || 'NO USER');
    console.log('✅ Tokens blacklisted');
    console.log('✅ Cookies cleared');
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('🎉🎉🎉 LOGOUT SUCCESSFUL 🎉🎉🎉', {
      userId: req.user?.id,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'LOGOUT_SUCCESS',
      service: 'auth-middleware'
    });
    
    next();
  } catch (error) {
    // SUPER PROMINENT LOGOUT ERROR LOG
    console.log('\n' + '💥'.repeat(20));
    console.log('💥💥💥 LOGOUT ERROR 💥💥💥');
    console.log('💥 Error:', error.message);
    console.log('💥 Stack:', error.stack);
    console.log('💥'.repeat(20) + '\n');
    
    logger.error('💥💥💥 LOGOUT ERROR 💥💥💥', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'LOGOUT_ERROR',
      service: 'auth-middleware'
    });
    next(error);
  }
};

export { logout }; 