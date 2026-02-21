const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Validation for signup
const signupValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only alphanumeric characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

// Validation for login
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation for task creation
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .optional({ checkFalsy: true })
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors for ${req.originalUrl}:`, errors.array());
    return res.status(400).render('error', {
      title: 'Validation Error',
      status: 400,
      message: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  taskValidation,
  handleValidationErrors
};
