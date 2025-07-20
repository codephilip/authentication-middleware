// Export permissions
const { Permission, RolePermissions } = require('./permissions');

// AuthConfig interface converted to JSDoc for documentation
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

module.exports = {
  Permission,
  RolePermissions
}; 