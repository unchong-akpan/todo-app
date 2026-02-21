const logger = require('../config/logger');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    logger.debug(`User ${req.session.userId} authenticated`);
    return next();
  }
  logger.warn(`Unauthorized access attempt to ${req.originalUrl}`);
  res.redirect('/login');
};

// Check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/tasks');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};
