const express = require('express');
const cookieParser = require('cookie-parser');
const { initializeAuth } = require('./src/index');

// Set environment variables
process.env.JWT_SECRET = 'dev-secret';
process.env.JWT_REFRESH_SECRET = 'dev-refresh-secret';
process.env.JWT_AUDIENCE = 'dev-server';
process.env.JWT_ISSUER = 'auth-middleware';
process.env.REDIS_URL = 'redis://localhost:6380';

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

// Test route
app.get('/test', auth.authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Login route
app.post('/login', (req, res) => {
  const { userId, email, roles, permissions } = req.body;
  const tokens = auth.TokenManager.generateTokenPair({
    userId,
    email,
    roles,
    permissions
  });
  res.json({ tokens });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('JWT_AUDIENCE:', process.env.JWT_AUDIENCE);
  console.log('JWT_ISSUER:', process.env.JWT_ISSUER);
}); 