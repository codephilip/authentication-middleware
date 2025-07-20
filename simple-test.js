const jwt = require('jsonwebtoken');

// Set environment variables
process.env.JWT_SECRET = 'dev-secret';
process.env.JWT_REFRESH_SECRET = 'dev-refresh-secret';
process.env.JWT_AUDIENCE = 'dev-server';
process.env.JWT_ISSUER = 'auth-middleware';

console.log('Testing JWT directly...');

// Generate a token
const payload = { userId: '123', email: 'test@example.com', roles: ['USER'], permissions: ['READ'] };
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS512',
  expiresIn: '15m',
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER
});

console.log('Generated token:', token.substring(0, 50) + '...');

// Verify the token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS512'],
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  });
  
  console.log('✅ Token verification successful!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test the middleware directly
console.log('\nTesting middleware...');
const { validateToken } = require('./src/utils/tokenValidator');

validateToken(token).then(result => {
  console.log('Middleware validation result:', result ? 'SUCCESS' : 'FAILED');
  if (result) {
    console.log('Decoded user:', result);
  }
}).catch(error => {
  console.log('Middleware validation error:', error.message);
}); 