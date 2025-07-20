import request from 'supertest';
import { app } from '../server';
import { getRedisClient } from '../utils/redis';
import { TokenManager } from '../utils/tokenManager';

/**
 * Authentication Flow Test Suite
 * Tests the complete authentication lifecycle including:
 * - Login
 * - Token refresh
 * - Token validation
 * - Error handling
 */
describe('Authentication Flow', () => {
  const redis = getRedisClient();
  
  beforeEach(async () => {
    // Clear all tokens and session data before each test
    await redis.flushall();
  });

  describe('POST /login', () => {
    /**
     * Test successful login flow
     * Should return both access and refresh tokens
     */
    it('should return tokens when valid credentials are provided', async () => {
      // Arrange
      const testUser = {
        userId: '123',
        email: 'test@example.com',
        roles: ['USER'],
        permissions: ['READ']
      };

      // Act
      const response = await request(app)
        .post('/login')
        .send(testUser);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tokens');
      expect(response.headers['set-cookie']).toBeDefined();
      // Verify both tokens are set in cookies
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('accessToken'),
          expect.stringContaining('refreshToken')
        ])
      );
    });

    /**
     * Test login validation
     * Should reject requests with missing required fields
     */
    it('should handle invalid login data', async () => {
      const response = await request(app)
        .post('/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/refresh', () => {
    /**
     * Test token refresh flow
     * Should issue new access token when valid refresh token is provided
     */
    it('should refresh access token with valid refresh token', async () => {
      // First login to get initial tokens
      const loginResponse = await request(app)
        .post('/login')
        .send({
          userId: '123',
          email: 'test@example.com'
        });

      const cookies = loginResponse.headers['set-cookie'];
      
      // Attempt token refresh
      const refreshResponse = await request(app)
        .post('/api/refresh')
        .set('Cookie', cookies)
        .set('X-XSRF-TOKEN', 'test-csrf-token');

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.headers['set-cookie']).toBeDefined();
      expect(refreshResponse.body).toHaveProperty('accessToken');
    });

    /**
     * Test refresh token validation
     * Should reject refresh attempts with invalid tokens
     */
    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .set('Cookie', ['refreshToken=invalid'])
        .set('X-XSRF-TOKEN', 'test-csrf-token');

      expect(response.status).toBe(401);
    });
  });
});