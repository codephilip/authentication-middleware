import request from 'supertest';
import { app } from '../../example-service/src/server';
import { getRedisClient } from '../utils/redis';
import { TokenManager } from '../utils/tokenManager';

describe('Authentication Flow', () => {
  const redis = getRedisClient();
  
  beforeEach(async () => {
    await redis.flushall();
  });

  describe('POST /login', () => {
    it('should return tokens when valid credentials are provided', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          userId: '123',
          email: 'test@example.com',
          roles: ['USER'],
          permissions: ['READ']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tokens');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should handle invalid login data', async () => {
      const response = await request(app)
        .post('/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/login')
        .send({
          userId: '123',
          email: 'test@example.com'
        });

      const cookies = loginResponse.headers['set-cookie'];
      
      const refreshResponse = await request(app)
        .post('/api/refresh')
        .set('Cookie', cookies)
        .set('X-XSRF-TOKEN', 'test-csrf-token');

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.headers['set-cookie']).toBeDefined();
    });
  });
}); 