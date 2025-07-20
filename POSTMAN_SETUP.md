# Postman Setup for Auth Middleware

This directory contains Postman collection and environment files for testing the Authentication Middleware API.

## Files Overview

### Collections
- `Auth_Middleware.postman_collection.json` - Complete API collection with all endpoints and tests

### Environments
- `Auth_Middleware.postman_environment.json` - Development environment (localhost)
- `Auth_Middleware.postman_environment.staging.json` - Staging environment
- `Auth_Middleware.postman_environment.production.json` - Production environment

## Setup Instructions

### 1. Import Collection and Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Select `Auth_Middleware.postman_collection.json`
   - The collection will be imported with all endpoints and tests

3. **Import Environment:**
   - Click "Import" button again
   - Select the appropriate environment file:
     - `Auth_Middleware.postman_environment.json` for local development
     - `Auth_Middleware.postman_environment.staging.json` for staging
     - `Auth_Middleware.postman_environment.production.json` for production

4. **Select Environment:**
   - In the top-right corner, select the imported environment from the dropdown

### 2. Start the Authentication Middleware Server

```bash
# Navigate to the example service directory
cd example-service

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000` by default.

### 3. Test the API

#### Quick Start
1. **Health Check** - Verify the server is running
2. **Login** - Authenticate to get cookies
3. **Test Protected Endpoints** - Use the authenticated session

#### Detailed Testing Flow

1. **Health & Documentation**
   - `GET /health` - Verify server status
   - `GET /api-docs` - Access API documentation

2. **Authentication**
   - `POST /login` - Login with user credentials
   - `POST /login` (Admin Role) - Login with admin credentials
   - `POST /api/refresh` - Refresh access token
   - `POST /logout` - Logout and clear cookies

3. **Public Endpoints**
   - `GET /api/public` - Test public endpoint (no auth required)

4. **Protected Endpoints**
   - `GET /api/user` - Test user endpoint (requires auth)
   - `GET /api/admin` - Test admin endpoint (requires ADMIN_ACCESS)
   - `GET /api/limited` - Test rate-limited endpoint

5. **Token Management**
   - `POST /api/revoke` - Revoke user tokens

6. **Error Scenarios**
   - Test authentication failures
   - Test permission denials

## Environment Variables

### Base Configuration
- `baseUrl` - API base URL (e.g., `http://localhost:3000`)
- `contentType` - Request content type (`application/json`)
- `timeout` - Request timeout in milliseconds

### Authentication Variables
- `csrfToken` - CSRF token (auto-generated)
- `accessToken` - JWT access token (set by login)
- `refreshToken` - JWT refresh token (set by login)

### Test Data
- `userId` / `adminUserId` - Test user IDs
- `userEmail` / `adminEmail` - Test email addresses
- `userRoles` / `adminRoles` - User role arrays
- `userPermissions` / `adminPermissions` - User permission arrays

## Environment-Specific Configurations

### Development (localhost)
- **Base URL:** `http://localhost:3000`
- **Timeout:** 10 seconds
- **Use:** For local development and testing

### Staging
- **Base URL:** `https://staging-auth-middleware.example.com`
- **Timeout:** 15 seconds
- **Use:** For pre-production testing

### Production
- **Base URL:** `https://auth-middleware.example.com`
- **Timeout:** 20 seconds
- **Use:** For production testing (use with caution)

## Testing Features

### Automatic Cookie Management
- Cookies are automatically handled by Postman
- No need to manually set cookie headers
- Authentication state persists across requests

### Comprehensive Tests
Each endpoint includes tests for:
- ✅ Status code validation
- ✅ Response structure validation
- ✅ Cookie handling verification
- ✅ Error scenario testing

### Error Scenario Testing
- Access protected endpoints without authentication
- Access admin endpoints without proper permissions
- Test rate limiting functionality

## Troubleshooting

### Common Issues

1. **"Connection refused" errors**
   - Ensure the authentication middleware server is running
   - Check the `baseUrl` environment variable
   - Verify the server is running on the correct port

2. **"401 Unauthorized" errors**
   - Run the "Login" request first to authenticate
   - Check that cookies are being set properly
   - Verify the server's JWT configuration

3. **"403 Forbidden" errors**
   - Use the "Login with Admin Role" for admin endpoints
   - Check user permissions in the login request
   - Verify the authorization middleware configuration

4. **Test failures**
   - Check the server logs for detailed error messages
   - Verify the response format matches expected structure
   - Ensure all required environment variables are set

### Debug Mode
To enable detailed logging:
1. Set `NODE_ENV=development` in the server environment
2. Check the server console for detailed request/response logs
3. Use Postman's console to view request/response details

## Security Notes

- **Never commit real tokens** to version control
- **Use different test data** for different environments
- **Clear sensitive data** after testing
- **Use staging environment** for integration testing
- **Limit production testing** to authorized personnel only

## API Documentation

For detailed API documentation:
1. Start the server
2. Visit `http://localhost:3000/api-docs`
3. Explore the interactive Swagger documentation

## Support

For issues with the Postman collection:
1. Check the server logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure the server is running and accessible
4. Test with the health check endpoint first 