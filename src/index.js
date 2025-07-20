import { 
  authenticate, 
  authorize, 
  rateLimiter,
  securityHeaders,
  logout,
  csrfProtection,
  errorHandler 
} from './middleware/index.js';

import { TokenManager } from './utils/tokenManager.js';
import { Permission } from './types/permissions.js';

import { createLogger, httpLogger, performanceLogger } from './utils/logger.js';

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
export {
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