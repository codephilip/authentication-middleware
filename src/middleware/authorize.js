import { Permission, RolePermissions } from '../types/permissions.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware', 'AUTHZ');

const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // SUPER PROMINENT AUTHORIZATION MIDDLEWARE INVOCATION LOG
      console.log('\n' + '='.repeat(80));
      console.log('🚨🚨🚨 AUTHORIZATION MIDDLEWARE INVOKED 🚨🚨🚨');
      console.log('🔒 AUTHORIZATION MIDDLEWARE EXECUTING');
      console.log('📍 Path:', req.path);
      console.log('📋 Method:', req.method);
      console.log('👤 User:', req.user?.id || 'NO USER');
      console.log('🎭 Required Permissions:', requiredPermissions);
      console.log('⏰ Time:', new Date().toISOString());
      console.log('='.repeat(80) + '\n');
      
      logger.info('🚨🚨🚨 AUTHORIZATION MIDDLEWARE INVOKED 🚨🚨🚨', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        requiredPermissions,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'AUTHORIZATION',
        service: 'auth-middleware'
      });
      
      if (!req.user) {
        // SUPER PROMINENT AUTHZ FAILURE LOG
        console.log('\n' + '❌'.repeat(20));
        console.log('🚫🚫🚫 AUTHORIZATION FAILED 🚫🚫🚫');
        console.log('❌ Reason: No user in request');
        console.log('❌'.repeat(20) + '\n');
        
        logger.warn('🚫🚫🚫 AUTHORIZATION FAILED 🚫🚫🚫', {
          reason: 'No user in request',
          path: req.path,
          method: req.method,
          ip: req.ip,
          timestamp: new Date().toISOString(),
          middlewareType: 'AUTHORIZATION_FAILURE',
          service: 'auth-middleware'
        });
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userPermissions = req.user.roles.flatMap(
        role => RolePermissions[role] || []
      );

      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        // SUPER PROMINENT AUTHZ FAILURE LOG
        console.log('\n' + '❌'.repeat(20));
        console.log('🚫🚫🚫 AUTHORIZATION FAILED 🚫🚫🚫');
        console.log('❌ Reason: Insufficient permissions');
        console.log('👤 User:', req.user.id);
        console.log('🎭 Required:', requiredPermissions);
        console.log('🎭 Actual:', userPermissions);
        console.log('❌'.repeat(20) + '\n');
        
        logger.warn('🚫🚫🚫 AUTHORIZATION FAILED 🚫🚫🚫', {
          reason: 'Insufficient permissions',
          user: req.user.id,
          required: requiredPermissions,
          actual: userPermissions,
          path: req.path,
          method: req.method,
          ip: req.ip,
          timestamp: new Date().toISOString(),
          middlewareType: 'AUTHORIZATION_FAILURE',
          service: 'auth-middleware'
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // SUPER PROMINENT AUTHZ SUCCESS LOG
      console.log('\n' + '✅'.repeat(20));
      console.log('🎉🎉🎉 AUTHORIZATION SUCCESSFUL 🎉🎉🎉');
      console.log('👤 User:', req.user.id);
      console.log('🎭 Permissions granted');
      console.log('✅'.repeat(20) + '\n');
      
      logger.info('🎉🎉🎉 AUTHORIZATION SUCCESSFUL 🎉🎉🎉', {
        user: req.user.id,
        required: requiredPermissions,
        actual: userPermissions,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'AUTHORIZATION_SUCCESS',
        service: 'auth-middleware'
      });

      next();
    } catch (error) {
      // SUPER PROMINENT AUTHZ ERROR LOG
      console.log('\n' + '💥'.repeat(20));
      console.log('💥💥💥 AUTHORIZATION ERROR 💥💥💥');
      console.log('💥 Error:', error.message);
      console.log('💥 Stack:', error.stack);
      console.log('💥'.repeat(20) + '\n');
      
      logger.error('💥💥💥 AUTHORIZATION ERROR 💥💥💥', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        middlewareType: 'AUTHORIZATION_ERROR',
        service: 'auth-middleware'
      });
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

export { authorize }; 