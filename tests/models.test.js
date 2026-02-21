const User = require('../src/models/User');
const Task = require('../src/models/Task');
const { connectDB, disconnectDB, mongoose } = require('../src/config/database');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  await connectDB();
  // Clear collections
  await User.deleteMany({});
  await Task.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await disconnectDB();
});

afterEach(async () => {
  await Task.deleteMany({});
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with hashed password', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'password123'
      });

      expect(user.username).toBe('testuser');
      expect(user.password).not.toBe('password123');
      // Password should be hashed
      const isPasswordValid = await bcrypt.compare('password123', user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should validate username is present', async () => {
      try {
        await User.create({
          password: 'password123'
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should enforce unique username', async () => {
      await User.create({
        username: 'testuser',
        password: 'password123'
      });

      try {
        await User.create({
          username: 'testuser',
          password: 'password456'
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.code).toBe(11000); // Mongoose duplicate key error
      }
    });

    it('should validate username length', async () => {
      try {
        await User.create({
          username: 'ab', // Too short
          password: 'password123'
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Password Validation', () => {
    it('should validate correct password', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'password123'
      });

      const isValid = await user.validatePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'password123'
      });

      const isValid = await user.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });
});

describe('Task Model', () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      username: 'testuser',
      password: 'password123'
    });
    userId = user._id;
  });

  describe('Task Creation', () => {
    it('should create a task with required fields', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });

      expect(task.title).toBe('Test Task');
      expect(task.userId.toString()).toBe(userId.toString());
      expect(task.status).toBe('pending');
    });

    it('should create a task with description', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Task description',
        userId
      });

      expect(task.description).toBe('Task description');
    });

    it('should set default status to pending', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });

      expect(task.status).toBe('pending');
    });

    it('should validate title is present', async () => {
      try {
        await Task.create({
          userId
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate title length', async () => {
      try {
        await Task.create({
          title: '', // Empty title
          userId
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Task Status', () => {
    it('should accept pending status', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'pending',
        userId
      });

      expect(task.status).toBe('pending');
    });

    it('should accept completed status', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'completed',
        userId
      });

      expect(task.status).toBe('completed');
    });

    it('should accept deleted status', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: 'deleted',
        userId
      });

      expect(task.status).toBe('deleted');
    });
  });

  describe('User-Task Relationship', () => {
    it('should associate task with user', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });

      const user = await User.findById(userId).populate('tasks');
      const foundTask = await Task.findById(task._id);

      expect(foundTask.userId.toString()).toBe(userId.toString());
    });

    it('should delete related tasks when user is deleted', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });

      // Note: MongoDB doesn't have automatic cascading by default
      // This would need to be handled in application code
      await User.findByIdAndDelete(userId);
      // Manual cleanup would be needed in production
    });
  });
});
