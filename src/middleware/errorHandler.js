import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware', 'ERROR');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';
  const details = error.details;

  // SUPER PROMINENT AUTH ERROR HANDLER LOG
  console.log('\n' + '='.repeat(80));
  console.log('🚨🚨🚨 AUTH ERROR HANDLER INVOKED 🚨🚨🚨');
  console.log('💥 AUTH ERROR HANDLER EXECUTING');
  console.log('📍 Path:', req.path);
  console.log('📋 Method:', req.method);
  console.log('👤 User:', req.user?.id || 'NO USER');
  console.log('🌐 IP:', req.ip);
  console.log('💥 Error:', message);
  console.log('💥 Code:', code);
  console.log('💥 Status:', statusCode);
  console.log('⏰ Time:', new Date().toISOString());
  console.log('='.repeat(80) + '\n');
  
  logger.error('🚨🚨🚨 AUTH ERROR HANDLER INVOKED 🚨🚨🚨', {
    code,
    statusCode,
    details,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    middlewareType: 'AUTH_ERROR_HANDLER',
    service: 'auth-middleware',
    error: {
      message,
      code,
      statusCode,
      details,
      stack: error.stack
    }
  });

  res.status(statusCode).json({
    error: {
      message,
      code,
      requestId: req.id,
      ...(details && { details })
    }
  });
};

export { errorHandler }; 