# Todo Application

A simple yet powerful Todo application built with Node.js, Express, and MongoDB. Features user authentication, task management, and a clean web interface.

## Features

- **User Authentication**
  - User registration (signup)
  - User login with bcrypt password hashing
  - Session-based authentication
  - Secure password storage

- **Task Management**
  - Create tasks with title and description
  - Edit existing tasks
  - Mark tasks as completed
  - Soft delete tasks
  - Filter tasks by status (pending, completed, all)
  - Sort tasks (newest, oldest, alphabetical)

- **User Privacy**
  - Users can only see their own tasks
  - User-specific task filtering and sorting
  - Authorization checks on all task operations

- **Error Handling**
  - Global error handler
  - Input validation with express-validator
  - User-friendly error messages
  - Comprehensive error logging

- **Logging**
  - Winston logger with file rotation
  - Separate error and combined logs
  - Request logging with Morgan
  - Debug mode for development

## Project Structure

```
todo-app/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection configuration
│   │   └── logger.js         # Logger configuration
│   ├── controllers/
│   │   ├── authController.js # Authentication logic
│   │   └── taskController.js # Task operations logic
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   └── validation.js     # Input validation middleware
│   ├── models/
│   │   ├── User.js           # User Mongoose schema
│   │   └── Task.js           # Task Mongoose schema
│   └── routes/
│       ├── auth.js           # Authentication routes
│       └── tasks.js          # Task routes
├── views/
│   ├── layout.ejs            # Main layout
│   ├── login.ejs             # Login page
│   ├── signup.ejs            # Signup page
│   ├── error.ejs             # Error page
│   ├── 404.ejs               # 404 page
│   └── tasks/
│       ├── index.ejs         # Tasks list
│       ├── create.ejs        # Create task form
│       └── edit.ejs          # Edit task form
├── public/
│   └── style.css             # Stylesheet
├── tests/
│   ├── integration.test.js   # Integration tests
│   └── models.test.js        # Model unit tests
├── logs/                     # Log files
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                      # Environment configuration
├── .gitignore                # Git ignore rules
├── jest.config.js            # Jest configuration
└── ER_DIAGRAM.md             # Database schema documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher, or MongoDB Atlas cloud)
- npm or yarn

## Installation

1. **Clone or download the project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**
   - Copy `.env` file and update MongoDB URI

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/todo_app
   SESSION_SECRET=your_secret_key_change_this
   NODE_ENV=development
   LOG_LEVEL=info
   ```

   For MongoDB Atlas (cloud):

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo_app?retryWrites=true&w=majority
   ```

4. **MongoDB Setup** (choose one approach)

   **Option A: Local MongoDB**

   ```bash
   # Install MongoDB locally, then start the MongoDB service
   # Default connection: mongodb://localhost:27017/todo_app
   ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string and update MONGODB_URI in .env file

5. **Start the application**

   ```bash
   npm run dev        # Development with nodemon
   npm start          # Production
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser

## Usage

### User Registration

1. Click "Sign up here" on the login page
2. Enter username (3-20 alphanumeric characters)
3. Enter password (minimum 6 characters)
4. Confirm password
5. Click "Sign Up"

### User Login

1. Enter your username
2. Enter your password
3. Click "Login"

### Task Management

1. **View Tasks**: See all your tasks with their status
2. **Create Task**: Click "+ New Task" and fill in the form
3. **Edit Task**: Click "Edit" on any task to modify it
4. **Complete Task**: Click "✓ Complete" to mark as done
5. **Delete Task**: Click "🗑 Delete" to remove task
6. **Filter**: Use filter buttons to show pending, completed, or all tasks
7. **Sort**: Use sort dropdown to organize tasks

## API Routes

### Authentication Routes

- `GET /login` - Show login page
- `POST /login` - Process login
- `GET /signup` - Show signup page
- `POST /signup` - Process signup
- `GET /logout` - Logout user

### Task Routes (Requires Authentication)

- `GET /tasks` - View all tasks with filtering and sorting
- `GET /tasks/create` - Show create task form
- `POST /tasks` - Create new task
- `GET /tasks/:taskId/edit` - Show edit task form
- `POST /tasks/:taskId/edit` - Update task content
- `POST /tasks/:taskId/status` - Update task status
- `POST /tasks/:taskId/delete` - Delete task (soft delete)

## Testing

Run tests with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Integration Tests**: Authentication flow, task CRUD operations, authorization
- **Unit Tests**: User and Task models, password hashing, relationships

## Logging

Logs are stored in the `logs/` directory:

- **error.log**: Error-level logs
- **combined.log**: All logs combined

Log format includes timestamp, level, message, and additional metadata:

```
2026-02-21 10:30:45 [INFO]: User 'john' logged in successfully {}
2026-02-21 10:31:15 [ERROR]: Error updating task: {"message": "Task not found"}
```

## Error Handling

### Input Validation

- Username: 3-20 alphanumeric characters, unique
- Password: Minimum 6 characters
- Task Title: 1-255 characters required
- Task Description: Maximum 1000 characters

### Authorization

- Users can only access their own tasks
- Unauthorized access attempts are logged and denied

### Global Error Handler

- Catches all unhandled errors
- Returns appropriate HTTP status codes
- Sends error details to client (debug mode only in development)
- Logs all errors with context

## Security Features

1. **Password Security**
   - Passwords are hashed using bcryptjs (10 salt rounds)
   - Original passwords never stored in database

2. **Session Management**
   - Secure session cookies (httpOnly, secure in production)
   - 24-hour session timeout
   - Session-based authentication

3. **Authorization**
   - Middleware checks authentication before accessing protected routes
   - Task operations checked to ensure user ownership
   - CSRF protection through session validation

4. **Input Validation**
   - All inputs validated with express-validator
   - Length constraints enforced
   - Special characters prevented where appropriate

## Database Design

### Relationships

- **Users to Tasks**: One-to-Many (1:N)
  - Each user can have multiple tasks
  - Each task belongs to one user
  - Reference: tasks.userId → users.\_id
  - Application-level cascade delete

### Constraints

- Unique username per user
- ObjectId reference on userId (indexed for performance)
- Validation constraints on required fields
- Status field constrained to ['pending', 'completed', 'deleted']

### MongoDB Features Used

- **Schemas**: Mongoose validators for data consistency
- **Indexing**: Index on userId for fast queries
- **Timestamps**: Automatic createdAt and updatedAt
- **Pre-hooks**: Password hashing before save
- **Population**: Reference population for task queries

See `ER_DIAGRAM.md` for detailed schema documentation.

## Development

### Adding New Features

1. **Create Models**: Define Mongoose schema in `src/models/`
2. **Create Controllers**: Business logic in `src/controllers/`
3. **Create Routes**: Define routes in `src/routes/`
4. **Add Middleware**: Auth/validation in `src/middleware/`
5. **Create Views**: EJS templates in `views/`
6. **Write Tests**: Jest tests in `tests/`

### Code Style

- Use consistent indentation (2 spaces)
- Follow naming conventions (camelCase for variables, PascalCase for classes)
- Add comments for complex logic
- Log important operations

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use environment-specific database configuration
3. Set secure `SESSION_SECRET`
4. Enable HTTPS in production
5. Use process manager (PM2, forever) for running the server
6. Configure log rotation for large applications
7. Set up database backups

## Troubleshooting

### Database Connection Issues

- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

### Password Issues During Login

- Password must be at least 6 characters
- Check for typos in username/password
- Passwords are case-sensitive

### Session Issues

- Check browser cookies are enabled
- Clear cookies if session persists
- Restart server if session data corrupted

## Future Enhancements

- [ ] Task categories/labels
- [ ] Task priority levels
- [ ] Recurring tasks
- [ ] Email notifications
- [ ] Task sharing between users
- [ ] REST API with JWT authentication
- [ ] React/Vue frontend
- [ ] Task search functionality
- [ ] Task analytics/statistics
- [ ] Two-factor authentication

## License

This project is open source and available under the ISC License.

## Support

For issues or questions, please check the logs in `logs/` directory and ensure all dependencies are properly installed.
