const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// Auth routes
router.get('/signup', isNotAuthenticated, authController.signupPage);
router.post('/signup', isNotAuthenticated, signupValidation, handleValidationErrors, authController.signup);

router.get('/login', isNotAuthenticated, authController.loginPage);
router.post('/login', isNotAuthenticated, loginValidation, handleValidationErrors, authController.login);

router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;
