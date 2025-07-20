import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { initializeAuth } from 'auth-middleware';
import { swaggerDocument } from './swagger';
import { Request, Response } from 'express';
import { Permission } from 'auth-middleware/dist/types/permissions';
import { environment } from './config/environment';
import { setupLogging, logger } from './utils/logger';

const app = express();

// Setup logging first to capture all requests
setupLogging(app);

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize auth middleware
const auth = initializeAuth({
  jwtSecret: environment.JWT_SECRET,
  jwtRefreshSecret: environment.JWT_REFRESH_SECRET,
  redisUrl: environment.REDIS_URL,
  jwtAudience: environment.JWT_AUDIENCE,
  jwtIssuer: environment.JWT_ISSUER
});

// Extract commonly used middleware
const authenticate = auth.essential[0];
const rateLimiter = auth.essential[1];

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested');
  res.json({ status: 'healthy' });
});

// Authentication endpoints
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { userId, email, roles = ['USER'], permissions = ['READ'] } = req.body;
    logger.info('Login attempt', { userId, email, roles });

    const tokens = await auth.TokenManager.generateTokenPair({
      userId,
      email,
      roles,
      permissions
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    logger.success('Login successful', { userId });
    res.json({ message: 'Login successful', tokens });
  } catch (error) {
    logger.error('Login failed', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// API endpoints with different authorization levels
app.get('/api/public', (req: Request, res: Response) => {
  logger.info('Public endpoint accessed');
  res.json({ message: 'Public endpoint' });
});

app.get('/api/user', authenticate, (req: Request, res: Response) => {
  logger.info('User endpoint accessed', { userId: req.user?.id });
  res.json({ message: 'User endpoint', user: req.user });
});

app.get('/api/admin', 
  authenticate,
  auth.authorize(['ADMIN_ACCESS'] as Permission[]),
  (req: Request, res: Response) => {
    logger.info('Admin endpoint accessed', { userId: req.user?.id });
    res.json({ message: 'Admin endpoint', user: req.user });
  }
);

// Rate limited endpoint example
app.get('/api/limited', 
  authenticate,
  rateLimiter,
  (req: Request, res: Response) => {
    logger.info('Rate limited endpoint accessed', { userId: req.user?.id });
    res.json({ message: 'Rate limited endpoint' });
  }
);

// Token management endpoints
app.post('/api/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    const newTokens = await auth.TokenManager.generateTokenPair({
      userId: req.user!.id,
      email: req.user!.email,
      roles: req.user!.roles,
      permissions: req.user!.permissions
    });

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    logger.info('Token refreshed successfully', { userId: req.user?.id });
    res.json({ message: 'Token refreshed', accessToken: newTokens.accessToken });
  } catch (error) {
    logger.error('Token refresh failed', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

app.post('/api/revoke', 
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.user!;
      await auth.TokenManager.revokeUserTokens(id);
      logger.info('Tokens revoked', { userId: id });
      res.json({ message: 'Tokens revoked' });
    } catch (error) {
      logger.error('Token revocation failed', error);
      res.status(500).json({ error: 'Token revocation failed' });
    }
  }
);

app.post('/logout', auth.logout, (req: Request, res: Response) => {
  logger.info('User logged out', { userId: req.user?.id });
  res.json({ message: 'Logged out successfully' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.success(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`
Available endpoints:
- GET  /health           - Health check
- POST /login           - Get test tokens
- GET  /api/public      - Public endpoint
- GET  /api/user        - Protected endpoint
- GET  /api/admin       - Admin endpoint (requires ADMIN_ACCESS)
- GET  /api/limited     - Rate limited endpoint
- POST /api/refresh     - Refresh access token
- POST /api/revoke      - Revoke user tokens
- POST /logout          - Logout
- GET  /api-docs        - API documentation
  `);
}); 