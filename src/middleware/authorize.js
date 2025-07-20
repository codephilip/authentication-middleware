const { Permission, RolePermissions } = require('../types/permissions');
const { logger } = require('../utils/logger');

const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('Authorization failed: No user in request');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userPermissions = req.user.roles.flatMap(
        role => RolePermissions[role] || []
      );

      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn('Authorization failed: Insufficient permissions', {
          user: req.user.id,
          required: requiredPermissions,
          actual: userPermissions
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

module.exports = { authorize }; 