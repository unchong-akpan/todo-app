const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection established successfully.');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully.');
  } catch (err) {
    logger.error('MongoDB disconnection error:', err);
    throw err;
  }
};

module.exports = { connectDB, disconnectDB, mongoose };
