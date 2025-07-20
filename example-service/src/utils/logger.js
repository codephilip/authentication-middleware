const { createLogger, httpLogger, performanceLogger } = require('../../../src/utils/logger');

// Create logger instance using the local logging implementation
const logger = createLogger('auth-example', 'DEV');

const setupLogging = (app) => {
  // Add HTTP request logging
  app.use(httpLogger);

  // Add performance monitoring
  app.use(performanceLogger);

  return logger;
};

module.exports = { setupLogging, logger }; 