const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { 
  authenticate, 
  authorize, 
  rateLimiter,
  securityHeaders,
  logout,
  csrfProtection,
  errorHandler 
} = require('../middleware');
const { TokenManager } = require('../utils/tokenManager');
const { closeRedisConnection } = require('../utils/redis');

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_AUDIENCE = 'test-audience';
process.env.JWT_ISSUER = 'test-issuer';

describe('Authentication Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  describe('TokenManager', () => {
    test('should generate valid token pair', () => {
      const payload = { userId: '123', email: 'test@example.com', roles: ['USER'] };
      const tokens = TokenManager.generateTokenPair(payload);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    test('should generate different tokens for different payloads', () => {
      const payload1 = { userId: '123', email: 'test1@example.com', roles: ['USER'] };
      const payload2 = { userId: '456', email: 'test2@example.com', roles: ['ADMIN'] };
      
      const tokens1 = TokenManager.generateTokenPair(payload1);
      const tokens2 = TokenManager.generateTokenPair(payload2);
      
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('Authenticate Middleware', () => {
    test('should authenticate with valid token', async () => {
      const payload = { userId: '123', email: 'test@example.com', roles: ['USER'] };
      const tokens = TokenManager.generateTokenPair(payload);

      app.get('/test', authenticate, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id', '123');
    });

    test('should reject invalid token', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('should reject request without token', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
    });
  });

  describe('Authorize Middleware', () => {
    test('should authorize user with required permission', async () => {
      const payload = { 
        userId: '123', 
        email: 'test@example.com', 
        roles: ['USER'],
        permissions: ['READ']
      };
      const tokens = TokenManager.generateTokenPair(payload);

      app.get('/test', authenticate, authorize(['READ']), (req, res) => {
        res.json({ message: 'Authorized' });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
    });

    test('should reject user without required permission', async () => {
      const payload = { 
        userId: '123', 
        email: 'test@example.com', 
        roles: ['USER'],
        permissions: ['READ']
      };
      const tokens = TokenManager.generateTokenPair(payload);

      app.get('/test', authenticate, authorize(['ADMIN_ACCESS']), (req, res) => {
        res.json({ message: 'Authorized' });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Security Headers', () => {
    test('should add security headers', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Rate Limiter', () => {
    test('should allow requests within limit', async () => {
      app.use(rateLimiter());
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Error Handler', () => {
    test('should handle errors gracefully', async () => {
      app.use(errorHandler);
      app.get('/error', (req, res, next) => {
        next(new Error('Test error'));
      });

      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 