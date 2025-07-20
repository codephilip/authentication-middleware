import helmet from 'helmet';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware', 'SECURITY');

const securityHeaders = [
  helmet(),
  (req, res, next) => {
    // SUPER PROMINENT SECURITY HEADERS MIDDLEWARE INVOCATION LOG
    console.log('\n' + '='.repeat(80));
    console.log('🚨🚨🚨 SECURITY HEADERS MIDDLEWARE INVOKED 🚨🚨🚨');
    console.log('🛡️ SECURITY HEADERS MIDDLEWARE EXECUTING');
    console.log('📍 Path:', req.path);
    console.log('📋 Method:', req.method);
    console.log('🌐 IP:', req.ip);
    console.log('⏰ Time:', new Date().toISOString());
    console.log('='.repeat(80) + '\n');
    
    logger.info('🚨🚨🚨 SECURITY HEADERS MIDDLEWARE INVOKED 🚨🚨🚨', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'SECURITY_HEADERS',
      service: 'auth-middleware'
    });
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    
    // SUPER PROMINENT SECURITY HEADERS SUCCESS LOG
    console.log('\n' + '✅'.repeat(20));
    console.log('✅✅✅ SECURITY HEADERS APPLIED ✅✅✅');
    console.log('✅ Security headers set successfully');
    console.log('✅'.repeat(20) + '\n');
    
    logger.info('✅✅✅ SECURITY HEADERS APPLIED ✅✅✅', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      middlewareType: 'SECURITY_HEADERS_SUCCESS',
      service: 'auth-middleware'
    });
    
    next();
  }
];

export { securityHeaders }; 