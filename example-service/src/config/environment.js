const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'dev-server',
  JWT_ISSUER: process.env.JWT_ISSUER || 'auth-middleware'
};

module.exports = { environment }; 