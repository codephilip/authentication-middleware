const { 
  authenticate, 
  authorize, 
  rateLimiter,
  securityHeaders,
  logout,
  csrfProtection,
  errorHandler 
} = require('./middleware');

const { TokenManager } = require('./utils/tokenManager');
const { Permission } = require('./types/permissions');

const { createLogger, httpLogger, performanceLogger } = require('@codephil/logging-middleware');

const logger = createLogger(
  'auth-middleware', 'middleware'
);

const initializeAuth = (config) => {
  // Set environment variables from config
  process.env.JWT_SECRET = config.jwtSecret;
  process.env.JWT_REFRESH_SECRET = config.jwtRefreshSecret;
  process.env.JWT_AUDIENCE = config.jwtAudience;
  process.env.JWT_ISSUER = config.jwtIssuer;
  process.env.REDIS_URL = config.redisUrl;

  return {
    essential: [
      authenticate,
      rateLimiter(),
      securityHeaders,
      csrfProtection
    ],
    authenticate,
    authorize,
    logout,
    errorHandler,
    TokenManager
  };
};

// Export a simplified API
module.exports = {
  // Core middleware
  authenticate,
  authorize,
  rateLimiter,
  securityHeaders,
  logout,
  csrfProtection,
  errorHandler,
  
  // Utilities
  TokenManager,
  
  // Main function
  initializeAuth,
  
  // Logger
  logger,
  
  // Types
  Permission
}; 