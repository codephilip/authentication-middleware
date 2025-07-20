const { TokenManager } = require('../utils/tokenManager');
const { closeRedisConnection } = require('../utils/redis');

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_AUDIENCE = 'test-audience';
process.env.JWT_ISSUER = 'test-issuer';

describe('Token Manager Tests', () => {
  afterAll(async () => {
    await closeRedisConnection();
  });

  test('should generate token pair', () => {
    const payload = { userId: '123', roles: ['USER'] };
    const tokens = TokenManager.generateTokenPair(payload);
    
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });

  test('should generate tokens with different payloads', () => {
    const payload1 = { userId: '123', roles: ['USER'] };
    const payload2 = { userId: '456', roles: ['ADMIN'] };
    
    const tokens1 = TokenManager.generateTokenPair(payload1);
    const tokens2 = TokenManager.generateTokenPair(payload2);
    
    expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
    expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
  });
});

describe('Logger Tests', () => {
  test('should create logger instance', () => {
    const { createLogger } = require('../utils/logger');
    const logger = createLogger('test-service', 'TEST');
    
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('debug');
    expect(typeof logger.info).toBe('function');
  });
});

describe('Permissions Tests', () => {
  test('should export permissions', () => {
    const { Permission, RolePermissions } = require('../types/permissions');
    
    expect(Permission).toBeDefined();
    expect(RolePermissions).toBeDefined();
    expect(typeof Permission).toBe('object');
    expect(typeof RolePermissions).toBe('object');
  });
}); 