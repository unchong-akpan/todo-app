const User = require('../models/User');
const logger = require('../config/logger');

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logger.warn(`Signup failed: Username '${username}' already exists`);
      return res.status(400).render('signup', {
        title: 'Sign Up',
        error: 'Username already exists'
      });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();
    logger.info(`New user created: ${username} (ID: ${user._id})`);

    // Log the user in automatically
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    logger.info(`User '${username}' logged in successfully upon signup`);

    res.redirect('/tasks');
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).render('signup', {
      title: 'Sign Up',
      error: 'An error occurred during signup'
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login failed: User '${username}' not found`);
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user '${username}'`);
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid username or password'
      });
    }

    // Set session
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    logger.info(`User '${username}' logged in successfully`);

    res.redirect('/tasks');
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).render('login', {
      title: 'Login',
      error: 'An error occurred during login'
    });
  }
};

// Logout controller
exports.logout = (req, res) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    logger.info(`User '${username}' logged out`);
    res.redirect('/login');
  });
};

// Render signup page
exports.signupPage = (req, res) => {
  res.render('signup', { title: 'Sign Up' });
};

// Render login page
exports.loginPage = (req, res) => {
  res.render('login', { title: 'Login' });
};
