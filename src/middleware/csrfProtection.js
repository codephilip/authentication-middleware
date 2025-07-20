import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger.js';
import { getRedisClient } from '../utils/redis.js';

const logger = createLogger('auth-middleware', 'CSRF');

const redis = getRedisClient();

const csrfProtection = async (req, res, next) => {
  // SUPER PROMINENT CSRF MIDDLEWARE INVOCATION LOG
  console.log('\n' + '='.repeat(80));
  console.log('🚨🚨🚨 CSRF PROTECTION MIDDLEWARE INVOKED 🚨🚨🚨');
  console.log('🛡️ CSRF PROTECTION MIDDLEWARE EXECUTING');
  console.log('📍 Path:', req.path);
  console.log('📋 Method:', req.method);
  console.log('🌐 IP:', req.ip);
  console.log('⏰ Time:', new Date().toISOString());
  console.log('='.repeat(80) + '\n');
  
  logger.info('🚨🚨🚨 CSRF PROTECTION MIDDLEWARE INVOKED 🚨🚨🚨', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    middlewareType: 'CSRF_PROTECTION',
    service: 'auth-middleware'
  });
  
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
    
    // SUPER PROMINENT CSRF TOKEN GENERATED LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('✅✅✅ CSRF TOKEN GENERATED ✅✅✅');
    console.log('✅ Token generated for GET request');
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('✅✅✅ CSRF TOKEN GENERATED ✅✅✅', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'CSRF_TOKEN_GENERATED',
      service: 'auth-middleware'
    });
    
    next();
  } else {
    // Validate CSRF token for non-GET requests
    const csrfToken = req.headers['x-xsrf-token'] || req.body._csrf;
    const isValid = await redis.get(`csrf:${csrfToken}`);
    
    if (!isValid) {
      // SUPER PROMINENT CSRF VALIDATION FAILED LOG
      console.log('\n' + '❌'.repeat(20));
      console.log('🚫🚫🚫 CSRF VALIDATION FAILED 🚫🚫🚫');
      console.log('❌ Token:', csrfToken);
      console.log('❌ Method:', req.method);
      console.log('❌ Path:', req.path);
      console.log('❌'.repeat(20) + '\n');
      
      logger.warn('🚫🚫🚫 CSRF VALIDATION FAILED 🚫🚫🚫', {
        token: csrfToken,
        method: req.method,
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'CSRF_VALIDATION_FAILED',
        service: 'auth-middleware'
      });
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    // SUPER PROMINENT CSRF VALIDATION SUCCESS LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('✅✅✅ CSRF VALIDATION SUCCESSFUL ✅✅✅');
    console.log('✅ Token validated successfully');
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('✅✅✅ CSRF VALIDATION SUCCESSFUL ✅✅✅', {
      token: csrfToken,
      method: req.method,
      path: req.path,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'CSRF_VALIDATION_SUCCESS',
      service: 'auth-middleware'
    });
    
    next();
  }
};

export { csrfProtection }; 