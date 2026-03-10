require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const morgan = require('morgan');
const logger = require('./src/config/logger');
const { connectDB } = require('./src/config/database');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Morgan logger
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));

// Connect to MongoDB
connectDB()
  .then(() => logger.info('Database connected and ready'))
  .catch(err => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Routes
app.use('/', require('./src/routes/auth'));
app.use('/tasks', require('./src/routes/tasks'));

// Home route
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/tasks');
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).render('error', {
    title: 'Error',
    status,
    message,
    details: process.env.NODE_ENV === 'development' ? err.stack : ''
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
