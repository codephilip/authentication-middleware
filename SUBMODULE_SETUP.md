# Submodule Setup Guide

This guide explains how to use the authentication middleware as a GitHub submodule in your microservices.

## Quick Start

### 1. Add as Submodule

```bash
# In your microservice repository
git submodule add git@github.com:codephilip/authentication-middleware.git shared/auth-middleware
```

### 2. Initialize Submodule

```bash
git submodule update --init --recursive
```

### 3. Install Dependencies

```bash
cd shared/auth-middleware
npm install
cd ../..
```

### 4. Update Your Service's package.json

```json
{
  "dependencies": {
    "auth-middleware": "file:./shared/auth-middleware"
  }
}
```

### 5. Use in Your Express App

```javascript
const { initializeAuth } = require('./shared/auth-middleware/src/index');

const auth = initializeAuth({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL,
  jwtAudience: 'your-service-name',
  jwtIssuer: 'auth-service'
});

// Apply essential middleware
app.use(...auth.essential);

// Protected route
app.get('/protected',
  auth.authenticate,
  auth.authorize(['READ']),
  (req, res) => {
    res.json({ message: 'Protected resource' });
  }
);
```

## Submodule Management

### Update to Latest Version

```bash
# Update to latest commit on main branch
git submodule update --remote shared/auth-middleware

# Commit the update
git add shared/auth-middleware
git commit -m "Update auth-middleware to latest version"
```

### Update to Specific Version

```bash
cd shared/auth-middleware
git fetch --tags
git checkout v1.0.0  # Replace with desired version
cd ../..
git add shared/auth-middleware
git commit -m "Update auth-middleware to v1.0.0"
```

### Clone Project with Submodules

```bash
# Clone with submodules
git clone --recursive <your-repo-url>

# Or clone first, then initialize submodules
git clone <your-repo-url>
cd <your-repo>
git submodule update --init --recursive
```

### Remove Submodule

```bash
# Remove submodule
git submodule deinit shared/auth-middleware
git rm shared/auth-middleware
git commit -m "Remove auth-middleware submodule"

# Clean up
rm -rf .git/modules/shared/auth-middleware
```

## Production Deployment

### Docker Setup

If using Docker, ensure the submodule is included in your build context:

```dockerfile
# Copy the entire project including submodules
COPY . /app
WORKDIR /app

# Install dependencies including submodule
RUN npm install
RUN cd shared/auth-middleware && npm install
```

### CI/CD Pipeline

For CI/CD pipelines, make sure to clone with submodules:

```yaml
# GitHub Actions example
- name: Checkout with submodules
  uses: actions/checkout@v3
  with:
    submodules: recursive
```

```yaml
# GitLab CI example
before_script:
  - git submodule update --init --recursive
```

## Version Control Best Practices

### 1. Pin to Specific Versions

For production stability, pin to specific versions:

```bash
cd shared/auth-middleware
git checkout v1.0.0
cd ../..
git add shared/auth-middleware
git commit -m "Pin auth-middleware to v1.0.0"
```

### 2. Regular Updates

Set up a schedule to update the submodule:

```bash
# Monthly update script
#!/bin/bash
cd shared/auth-middleware
git fetch origin
git checkout origin/main
cd ../..
git add shared/auth-middleware
git commit -m "Monthly auth-middleware update"
```

### 3. Testing Updates

Always test submodule updates:

```bash
# Update submodule
git submodule update --remote shared/auth-middleware

# Run tests
npm test

# If tests pass, commit
git add shared/auth-middleware
git commit -m "Update auth-middleware - tests passing"
```

## Troubleshooting

### Submodule Not Found

```bash
# Re-initialize submodules
git submodule update --init --recursive
```

### Permission Issues

Ensure you have access to the GitHub repository:

```bash
# Test SSH access
ssh -T git@github.com

# Or use HTTPS
git submodule add https://github.com/codephilip/authentication-middleware.git shared/auth-middleware
```

### Dependencies Not Installed

```bash
# Install submodule dependencies
cd shared/auth-middleware
npm install
cd ../..

# Install your service dependencies
npm install
```

## Security Considerations

1. **Access Control**: Ensure only authorized developers can update the submodule
2. **Version Pinning**: Pin to specific versions in production
3. **Security Updates**: Regularly update to get security patches
4. **Audit Dependencies**: Run `npm audit` in the submodule directory

## Monitoring

Monitor submodule updates in your deployment pipeline:

```bash
# Check for updates
cd shared/auth-middleware
git fetch origin
git log HEAD..origin/main --oneline

# If updates available, notify team
if [ $(git log HEAD..origin/main --oneline | wc -l) -gt 0 ]; then
  echo "Auth middleware updates available"
fi
``` 