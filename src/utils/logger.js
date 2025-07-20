import { createLogger as createSharedLogger, createHttpLogger } from '@shared/logging';

const createLogger = (service, component) => {
  return createSharedLogger(service, component);
};

const httpLogger = createHttpLogger('auth-middleware');
const performanceLogger = createHttpLogger('auth-middleware');

export {
  createLogger,
  httpLogger,
  performanceLogger
}; 