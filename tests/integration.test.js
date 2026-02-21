const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const { connectDB, disconnectDB } = require('../src/config/database');

// Setup and teardown
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  // Clean up after each test
  await Task.deleteMany({});
  await User.deleteMany({});
});

describe('Authentication Routes', () => {
  describe('GET /signup', () => {
    it('should render signup page when not authenticated', async () => {
      const res = await request(app)
        .get('/signup');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });
      
      expect(res.status).toBe(200);
    });

    it('should reject signup with short username', async () => {
      const res = await request(app)
        .post('/signup')
        .send({
          username: 'ab',
          password: 'password123',
          confirmPassword: 'password123'
        });
      
      expect(res.status).toBe(400);
    });

    it('should reject signup with mismatched passwords', async () => {
      const res = await request(app)
        .post('/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password456'
        });
      
      expect(res.status).toBe(400);
    });

    it('should reject signup with duplicate username', async () => {
      // Create first user
      await User.create({
        username: 'testuser',
        password: 'hashedpassword'
      });

      const res = await request(app)
        .post('/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /login', () => {
    it('should render login page', async () => {
      const res = await request(app)
        .get('/login');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/tasks');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
    });

    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });
      
      expect(res.status).toBe(401);
    });
  });
});

describe('Task Routes', () => {
  let userId;
  let agent = request.agent(app);

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      username: 'testuser',
      password: 'password123'
    });
    userId = user._id;

    // Login
    agent = request.agent(app);
    await agent
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
  });

  describe('GET /tasks', () => {
    it('should redirect to login when not authenticated', async () => {
      const res = await request(app)
        .get('/tasks');
      expect(res.status).toBe(302);
    });

    it('should show tasks for authenticated user', async () => {
      // Create test task
      await Task.create({
        title: 'Test Task',
        userId
      });

      const res = await agent.get('/tasks');
      expect(res.status).toBe(200);
    });

    it('should filter by pending status', async () => {
      await Task.create({
        title: 'Pending Task',
        status: 'pending',
        userId
      });

      const res = await agent.get('/tasks?filter=pending');
      expect(res.status).toBe(200);
    });

    it('should filter by completed status', async () => {
      await Task.create({
        title: 'Completed Task',
        status: 'completed',
        userId
      });

      const res = await agent.get('/tasks?filter=completed');
      expect(res.status).toBe(200);
    });

    it('should sort by newest', async () => {
      await Task.create({
        title: 'Task 1',
        userId
      });
      await Task.create({
        title: 'Task 2',
        userId
      });

      const res = await agent.get('/tasks?sort=newest');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const res = await agent
        .post('/tasks')
        .send({
          title: 'New Task',
          description: 'Task description'
        });
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/tasks');
    });

    it('should reject task with empty title', async () => {
      const res = await agent
        .post('/tasks')
        .send({
          title: '',
          description: 'Task description'
        });
      
      expect(res.status).toBe(400);
    });

    it('should reject task with title exceeding max length', async () => {
      const res = await agent
        .post('/tasks')
        .send({
          title: 'a'.repeat(300),
          description: 'Task description'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /tasks/:taskId/status', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });
      taskId = task._id;
    });

    it('should update task status to completed', async () => {
      const res = await agent
        .post(`/tasks/${taskId}/status`)
        .send({ status: 'completed' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedTask = await Task.findById(taskId);
      expect(updatedTask.status).toBe('completed');
    });

    it('should reject invalid status', async () => {
      const res = await agent
        .post(`/tasks/${taskId}/status`)
        .send({ status: 'invalid' });
      
      expect(res.status).toBe(400);
    });

    it('should not allow updating other user task', async () => {
      // Create another user
      const user2 = await User.create({
        username: 'testuser2',
        password: 'password123'
      });

      const agent2 = request.agent(app);
      await agent2
        .post('/login')
        .send({
          username: 'testuser2',
          password: 'password123'
        });

      const res = await agent2
        .post(`/tasks/${taskId}/status`)
        .send({ status: 'completed' });
      
      expect(res.status).toBe(403);
    });
  });

  describe('POST /tasks/:taskId/delete', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId
      });
      taskId = task._id;
    });

    it('should delete a task', async () => {
      const res = await agent
        .post(`/tasks/${taskId}/delete`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedTask = await Task.findById(taskId);
      expect(deletedTask.status).toBe('deleted');
    });

    it('should not allow deleting other user task', async () => {
      const user2 = await User.create({
        username: 'testuser2',
        password: 'password123'
      });

      const agent2 = request.agent(app);
      await agent2
        .post('/login')
        .send({
          username: 'testuser2',
          password: 'password123'
        });

      const res = await agent2
        .post(`/tasks/${taskId}/delete`);
      
      expect(res.status).toBe(403);
    });
  });
});
