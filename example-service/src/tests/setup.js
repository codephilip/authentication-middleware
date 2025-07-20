// Test setup for example service
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_AUDIENCE = 'test-audience';
process.env.JWT_ISSUER = 'test-issuer';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.PORT = '3001'; 