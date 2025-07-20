import { createLogger, httpLogger, performanceLogger } from '@codephil/logging-middleware';
import type { Express } from 'express';

// Create logger instance using the same library as the main package
const logger = createLogger('auth-example', 'DEV');

export const setupLogging = (app: Express) => {
  // Add HTTP request logging
  app.use(httpLogger(logger));

  // Add performance monitoring
  app.use(performanceLogger(logger));

  return logger;
};

export { logger }; 