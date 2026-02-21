const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskValidation, handleValidationErrors } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

// All task routes require authentication
router.use(isAuthenticated);

// Get all tasks
router.get('/', taskController.getTasks);

// Create task page
router.get('/create', taskController.renderCreatePage);

// Create task
router.post('/', taskValidation, handleValidationErrors, taskController.createTask);

// Edit task page
router.get('/:taskId/edit', taskController.renderEditPage);

// Update task content
router.post('/:taskId/edit', taskValidation, handleValidationErrors, taskController.updateTask);

// Update task status
router.post('/:taskId/status', taskController.updateTaskStatus);

// Delete task
router.post('/:taskId/delete', taskController.deleteTask);

module.exports = router;
