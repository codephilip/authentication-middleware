const { createLogger } = require('@codephil/logging-middleware');

// Create a singleton logger instance for the auth middleware
const logger = createLogger('auth-middleware', 'AUTH');

module.exports = { logger }; 