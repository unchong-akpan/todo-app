const Task = require('../models/Task');
const User = require('../models/User');
const logger = require('../config/logger');

// Get all tasks for user with filtering and sorting
exports.getTasks = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { filter = 'all', sort = 'newest' } = req.query;

    let query = { userId };

    // Apply filter
    if (filter === 'pending') {
      query.status = 'pending';
    } else if (filter === 'completed') {
      query.status = 'completed';
    } else if (filter === 'active') {
      query.status = { $in: ['pending', 'completed'] };
    }

    let sortQuery = {};
    if (sort === 'newest') {
      sortQuery.createdAt = -1;
    } else if (sort === 'oldest') {
      sortQuery.createdAt = 1;
    } else if (sort === 'alphabetical') {
      sortQuery.title = 1;
    }

    const tasks = await Task.find(query)
      .sort(sortQuery)
      .populate('userId', 'username')
      .exec();

    logger.debug(`Retrieved ${tasks.length} tasks for user ${userId}`);

    res.render('tasks/index', {
      title: 'My Tasks',
      tasks,
      filter,
      sort,
      username: req.session.username
    });
  } catch (error) {
    logger.error('Error retrieving tasks:', error);
    res.status(500).render('error', {
      title: 'Error',
      status: 500,
      message: 'Failed to retrieve tasks'
    });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.session.userId;

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : null,
      userId
    });

    await task.save();
    logger.info(`Task created: "${title}" (ID: ${task._id}) by user ${userId}`);
    res.redirect('/tasks?filter=pending');
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).render('error', {
      title: 'Error',
      status: 500,
      message: 'Failed to create task'
    });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.session.userId;

    // Validate status
    const validStatuses = ['pending', 'completed', 'deleted'];
    if (!validStatuses.includes(status)) {
      logger.warn(`Invalid status '${status}' for task ${taskId}`);
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find and verify ownership
    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn(`Task ${taskId} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== userId) {
      logger.warn(`User ${userId} attempted to update task ${taskId} (not owner)`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    logger.info(`Task ${taskId} status updated to '${status}' by user ${userId}`);

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task (soft delete)
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.session.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn(`Task ${taskId} not found for deletion`);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== userId) {
      logger.warn(`User ${userId} attempted to delete task ${taskId} (not owner)`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.findByIdAndUpdate(taskId, { status: 'deleted' }, { new: true });
    logger.info(`Task ${taskId} marked as deleted by user ${userId}`);

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Render create task page
exports.renderCreatePage = (req, res) => {
  res.render('tasks/create', {
    title: 'Create Task',
    username: req.session.username
  });
};

// Edit task page
exports.renderEditPage = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.session.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn(`Task ${taskId} not found`);
      return res.status(404).render('error', {
        title: 'Error',
        status: 404,
        message: 'Task not found'
      });
    }

    if (task.userId.toString() !== userId) {
      logger.warn(`User ${userId} attempted to edit task ${taskId} (not owner)`);
      return res.status(403).render('error', {
        title: 'Error',
        status: 403,
        message: 'Unauthorized'
      });
    }

    res.render('tasks/edit', {
      title: 'Edit Task',
      task,
      username: req.session.username
    });
  } catch (error) {
    logger.error('Error rendering edit page:', error);
    res.status(500).render('error', {
      title: 'Error',
      status: 500,
      message: 'Failed to load task'
    });
  }
};

// Update task content
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description } = req.body;
    const userId = req.session.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      logger.warn(`Task ${taskId} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== userId) {
      logger.warn(`User ${userId} attempted to update task ${taskId} (not owner)`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.findByIdAndUpdate(taskId, {
      title: title.trim(),
      description: description ? description.trim() : null
    });

    logger.info(`Task ${taskId} content updated by user ${userId}`);
    res.redirect('/tasks');
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).render('error', {
      title: 'Error',
      status: 500,
      message: 'Failed to update task'
    });
  }
};
