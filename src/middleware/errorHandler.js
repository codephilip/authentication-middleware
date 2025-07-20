const { logger } = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';
  const details = error.details;

  logger.error(`Auth Error: ${message}`, {
    code,
    statusCode,
    details,
    path: req.path,
    method: req.method,
    requestId: req.id,
    error
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

module.exports = { errorHandler }; 