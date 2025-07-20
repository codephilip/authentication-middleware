import request from 'supertest';
import { app } from '../../example-service/src/server';
import { TokenManager } from '../utils/tokenManager';

describe('Protected Endpoints', () => {
  let accessToken: string;
  let csrfToken: string;

  beforeEach(async () => {
    // Generate test tokens
    const tokens = await TokenManager.generateTokenPair({
      userId: 'test-user',
      email: 'test@example.com',
      roles: ['USER'],
      permissions: ['READ']
    });
    accessToken = tokens.accessToken;
    csrfToken = 'test-csrf-token';
  });

  describe('GET /api/user', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Cookie', [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin', () => {
    it('should deny access without admin role', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Cookie', [`accessToken=${accessToken}`])
        .set('X-XSRF-TOKEN', csrfToken);

      expect(response.status).toBe(403);
    });
  });
}); 