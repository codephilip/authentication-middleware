const createLogger = (service, component) => {
  return {
    info: (message, metadata = {}) => {
      console.log(JSON.stringify({
        level: 'info',
        service,
        component,
        message,
        metadata,
        timestamp: new Date().toISOString()
      }));
    },
    error: (message, metadata = {}) => {
      console.error(JSON.stringify({
        level: 'error',
        service,
        component,
        message,
        metadata,
        timestamp: new Date().toISOString()
      }));
    },
    warn: (message, metadata = {}) => {
      console.warn(JSON.stringify({
        level: 'warn',
        service,
        component,
        message,
        metadata,
        timestamp: new Date().toISOString()
      }));
    },
    debug: (message, metadata = {}) => {
      console.debug(JSON.stringify({
        level: 'debug',
        service,
        component,
        message,
        metadata,
        timestamp: new Date().toISOString()
      }));
    }
  };
};

const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      level: 'info',
      service: 'auth-middleware',
      component: 'HTTP',
      message: `${req.method} ${req.path} ${res.statusCode}`,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date().toISOString()
    }));
  });
  next();
};

const performanceLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      level: 'info',
      service: 'auth-middleware',
      component: 'PERFORMANCE',
      message: `Request completed`,
      metadata: {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode
      },
      timestamp: new Date().toISOString()
    }));
  });
  next();
};

module.exports = {
  createLogger,
  httpLogger,
  performanceLogger
}; 