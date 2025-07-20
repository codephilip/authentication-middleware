# Quick Start - Auth Middleware Submodule

## Add to Your Microservice

```bash
# Add as submodule
git submodule add git@github.com:codephilip/authentication-middleware.git shared/auth-middleware

# Initialize
git submodule update --init --recursive

# Install dependencies
cd shared/auth-middleware && npm install && cd ../..
```

## Update Your package.json

```json
{
  "dependencies": {
    "auth-middleware": "file:./shared/auth-middleware"
  }
}
```

## Use in Your Express App

```javascript
const { initializeAuth } = require('./shared/auth-middleware/src/index');

const auth = initializeAuth({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL,
  jwtAudience: 'your-service-name',
  jwtIssuer: 'auth-service'
});

// Apply middleware
app.use(...auth.essential);

// Protected route
app.get('/protected',
  auth.authenticate,
  auth.authorize(['READ']),
  (req, res) => res.json({ message: 'Protected' })
);
```

## Update Submodule

```bash
# To latest version
git submodule update --remote shared/auth-middleware

# To specific version
cd shared/auth-middleware
git checkout v1.0.0
cd ../..
git add shared/auth-middleware
git commit -m "Update auth-middleware"
```

## Environment Variables

```bash
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379
JWT_AUDIENCE=your-service-name
JWT_ISSUER=auth-service
```

## Available Versions

- `v1.0.0` - Production ready with submodule support

## Documentation

- [Full README](README.md)
- [Submodule Setup Guide](SUBMODULE_SETUP.md)
- [Microservice Example](examples/microservice-setup.md)
- [Management Script](scripts/update-submodule.sh) 