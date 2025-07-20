# Microservice Setup Example

This example shows how to integrate the auth middleware into a new microservice.

## Project Structure

```
my-microservice/
├── src/
│   ├── index.js
│   ├── routes/
│   │   └── protected.js
│   └── config/
│       └── environment.js
├── shared/
│   └── auth-middleware/  # Submodule
├── package.json
├── .env
└── .gitmodules
```

## Step-by-Step Setup

### 1. Initialize Your Microservice

```bash
mkdir my-microservice
cd my-microservice
git init
```

### 2. Add Auth Middleware as Submodule

```bash
# Add the submodule
git submodule add git@github.com:codephilip/authentication-middleware.git shared/auth-middleware

# Initialize it
git submodule update --init --recursive
```

### 3. Create package.json

```json
{
  "name": "my-microservice",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.4.7",
    "auth-middleware": "file:./shared/auth-middleware"
  },
  "devDependencies": {
    "nodemon": "^3.1.9",
    "jest": "^29.7.0"
  }
}
```

### 4. Create Environment Configuration

```javascript
// src/config/environment.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtAudience: process.env.JWT_AUDIENCE || 'my-microservice',
  jwtIssuer: process.env.JWT_ISSUER || 'auth-service'
};
```

### 5. Create Main Application

```javascript
// src/index.js
const express = require('express');
const { initializeAuth } = require('../shared/auth-middleware/src/index');
const config = require('./config/environment');

const app = express();

// Initialize auth middleware
const auth = initializeAuth({
  jwtSecret: config.jwtSecret,
  jwtRefreshSecret: config.jwtRefreshSecret,
  redisUrl: config.redisUrl,
  jwtAudience: config.jwtAudience,
  jwtIssuer: config.jwtIssuer
});

// Apply essential middleware
app.use(...auth.essential);

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Protected routes
app.get('/api/protected',
  auth.authenticate,
  auth.authorize(['READ']),
  (req, res) => {
    res.json({ 
      message: 'Protected resource',
      user: req.user 
    });
  }
);

// Admin routes
app.get('/api/admin',
  auth.authenticate,
  auth.authorize(['ADMIN']),
  (req, res) => {
    res.json({ 
      message: 'Admin resource',
      user: req.user 
    });
  }
);

// Logout route
app.post('/api/logout', auth.logout);

// Error handling
app.use(auth.errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6. Create Environment File

```bash
# .env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
REDIS_URL=redis://localhost:6379
JWT_AUDIENCE=my-microservice
JWT_ISSUER=auth-service
```

### 7. Install Dependencies

```bash
# Install your service dependencies
npm install

# Install submodule dependencies
cd shared/auth-middleware
npm install
cd ../..
```

### 8. Test the Setup

```bash
# Start Redis (if not running)
docker run --name redis -p 6379:6379 -d redis:alpine

# Start your service
npm run dev
```

### 9. Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Protected endpoint (will fail without token)
curl http://localhost:3000/api/protected
```

## Docker Setup

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/auth-middleware/package*.json ./shared/auth-middleware/

# Install dependencies
RUN npm install
RUN cd shared/auth-middleware && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  my-microservice:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        submodules: recursive
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm install
        cd shared/auth-middleware && npm install
    
    - name: Run tests
      run: npm test
    
    - name: Deploy
      run: |
        # Your deployment commands here
        echo "Deploying..."
```

## Submodule Management

### Update to Latest Version

```bash
# Update submodule
git submodule update --remote shared/auth-middleware

# Test the update
npm test

# Commit if tests pass
git add shared/auth-middleware
git commit -m "Update auth-middleware to latest version"
```

### Pin to Specific Version

```bash
cd shared/auth-middleware
git fetch --tags
git checkout v1.0.0
cd ../..
git add shared/auth-middleware
git commit -m "Pin auth-middleware to v1.0.0"
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Version Pinning**: Pin to specific versions in production
3. **Regular Updates**: Schedule regular security updates
4. **Access Control**: Limit who can update the submodule
5. **Audit Dependencies**: Run `npm audit` regularly

## Monitoring

Add logging to track authentication events:

```javascript
// In your route handlers
app.get('/api/protected',
  auth.authenticate,
  auth.authorize(['READ']),
  (req, res) => {
    console.log(`User ${req.user.id} accessed protected resource`);
    res.json({ message: 'Protected resource' });
  }
);
``` 