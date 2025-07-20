const { createLogger: createSharedLogger } = require('@shared/logging');

const createLogger = (service, component) => {
  return createSharedLogger(service, component);
};

const { createHttpLogger } = require('@shared/logging');

const httpLogger = createHttpLogger('auth-middleware');
const performanceLogger = createHttpLogger('auth-middleware');

module.exports = {
  createLogger,
  httpLogger,
  performanceLogger
}; 