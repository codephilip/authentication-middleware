# Auth Middleware

A reusable authentication and authorization middleware for Express microservices.

## Features

- JWT-based authentication
- Role-based authorization
- Rate limiting
- Token refresh mechanism
- CSRF protection
- Secure cookie handling
- Redis-based token management
- Integrated logging with @codephil/logging-middleware

## Installation

```bash
git submodule add https://github.com/codephil/auth-middleware.git deps/auth-middleware

git submodule update --init --recursive
```

## Setup

1. Install dependencies:

```bash
cd src/middleware/auth-middleware
npm install
```

2. Initialize the middleware in your Express app:

```javascript
const { initializeAuth } = require('./middleware/auth-middleware/src/index');

const auth = initializeAuth({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL,
  jwtAudience: 'your-service-name',
  jwtIssuer: 'auth-service'
});

// Apply essential middleware
app.use(...auth.essential);

// Protected route example
app.get('/protected',
  auth.authenticate,
  auth.authorize(['READ']),
  (req, res) => {
    res.json({ message: 'Protected resource' });
  }
);
```

## Configuration

The `initializeAuth` function accepts the following configuration:

```javascript
/**
 * @typedef {Object} AuthConfig
 * @property {string} jwtSecret - JWT secret key
 * @property {string} jwtRefreshSecret - JWT refresh secret key
 * @property {string} [jwtAudience] - JWT audience
 * @property {string} [jwtIssuer] - JWT issuer
 * @property {string} redisUrl - Redis connection URL
 * @property {string} [cookieDomain] - Cookie domain
 * @property {boolean} [secureCookies] - Whether to use secure cookies
 */
```

## API Reference

### Middleware Components

- `auth.essential`: Array of essential middleware (authenticate, rateLimiter, securityHeaders, csrfProtection)
- `auth.authenticate`: Authentication middleware
- `auth.authorize(permissions)`: Authorization middleware
- `auth.logout`: Logout handler
- `auth.errorHandler`: Error handling middleware

### TokenManager

- `TokenManager.generateTokenPair(payload)`: Generate access and refresh tokens
- `TokenManager.revokeUserTokens(userId)`: Revoke all tokens for a user
- `TokenManager.isTokenBlacklisted(token)`: Check if a token is blacklisted

## Local Development

1. Install dependencies:
```bash
npm install
cd example-service
npm install
```

2. Start Redis (required for token management):
```bash
docker run --name redis -p 6379:6379 -d redis:alpine
```

3. Run the example service:
```bash
npm run dev
```

4. Visit http://localhost:3000/api-docs to view the API documentation and test the endpoints.

## Testing

To run tests:

```bash
npm test
npm run test:coverage
```

## Logging

This middleware uses @codephil/logging-middleware for structured logging. All authentication and authorization events are logged with appropriate context and severity levels.

Example log output:

```json
{
  "level": "info",
  "service": "auth-middleware",
  "component": "AUTH",
  "message": "Authentication successful",
  "metadata": {
    "userId": "123",
    "roles": ["USER"]
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

## Docker

### Build and start all services
```bash
docker-compose up --build
```

### Run tests in auth-middleware container
```bash
docker-compose exec auth-service npm test
```

### View logs
```bash
docker-compose logs -f auth-service
```

## Usage

The middleware packages can be used across different microservices by adding them as dependencies in your service's package.json:

```json
{
  "dependencies": {
    "auth-middleware": "file:../auth-middleware",
    "logging-middleware": "file:../logging-middleware"
  }
}
```

## JavaScript Implementation

This middleware is now implemented in pure JavaScript (ES6+) and can be used directly without any TypeScript compilation step. All type definitions have been converted to JSDoc comments for better IDE support and documentation.
