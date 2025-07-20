const jwt = require('jsonwebtoken');

// Set environment variables
process.env.JWT_SECRET = 'dev-secret';
process.env.JWT_REFRESH_SECRET = 'dev-refresh-secret';
process.env.JWT_AUDIENCE = 'dev-server';
process.env.JWT_ISSUER = 'auth-middleware';

// Test token generation
const payload = { userId: '123', email: 'test@example.com', roles: ['USER'], permissions: ['READ'] };

console.log('Generating token with payload:', payload);
console.log('Using JWT_SECRET:', process.env.JWT_SECRET);
console.log('Using JWT_AUDIENCE:', process.env.JWT_AUDIENCE);
console.log('Using JWT_ISSUER:', process.env.JWT_ISSUER);

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS512',
  expiresIn: '15m',
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER
});

console.log('\nGenerated token:', token);

// Test token validation
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS512'],
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  });
  
  console.log('\n✅ Token validation successful!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('\n❌ Token validation failed:', error.message);
} 