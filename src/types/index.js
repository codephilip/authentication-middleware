const authTypes = require('./auth.types');
const permissions = require('./permissions');

module.exports = {
  ...authTypes,
  ...permissions
}; 