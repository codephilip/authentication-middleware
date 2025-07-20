const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { initializeAuth } = require('../../../src/index');

// Create test app
const app = express();
app.use(cookieParser());
app.use(express.json());

// Initialize auth middleware
const auth = initializeAuth({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL,
  jwtAudience: process.env.JWT_AUDIENCE,
  jwtIssuer: process.env.JWT_ISSUER
});

// Test routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/login', async (req, res) => {
  try {
    const { userId, email, roles = ['USER'], permissions = ['READ'] } = req.body;
    const tokens = auth.TokenManager.generateTokenPair({
      userId,
      email,
      roles,
      permissions
    });
    res.json({ message: 'Login successful', tokens });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

app.get('/api/user', auth.authenticate, (req, res) => {
  res.json({ message: 'User endpoint', user: req.user });
});

app.get('/api/admin', 
  auth.authenticate,
  auth.authorize(['ADMIN_ACCESS']),
  (req, res) => {
    res.json({ message: 'Admin endpoint', user: req.user });
  }
);

describe('Auth Middleware Integration Tests', () => {
  test('should return health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });

  test('should return public endpoint', async () => {
    const response = await request(app).get('/api/public');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Public endpoint' });
  });

  test('should login and generate tokens', async () => {
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
    expect(response.body.tokens).toHaveProperty('accessToken');
    expect(response.body.tokens).toHaveProperty('refreshToken');
  });

  test('should access protected endpoint with valid token', async () => {
    // First login to get token
    const loginResponse = await request(app)
      .post('/login')
      .send({
        userId: '123',
        email: 'test@example.com',
        roles: ['USER'],
        permissions: ['READ']
      });

    const token = loginResponse.body.tokens.accessToken;

    // Access protected endpoint
    const response = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', '123');
  });

  test('should reject access to protected endpoint without token', async () => {
    const response = await request(app).get('/api/user');
    expect(response.status).toBe(401);
  });

  test('should reject access to admin endpoint with user role', async () => {
    // Login with user role
    const loginResponse = await request(app)
      .post('/login')
      .send({
        userId: '123',
        email: 'test@example.com',
        roles: ['USER'],
        permissions: ['READ']
      });

    const token = loginResponse.body.tokens.accessToken;

    // Try to access admin endpoint
    const response = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
}); 