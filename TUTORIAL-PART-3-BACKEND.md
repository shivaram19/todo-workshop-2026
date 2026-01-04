# Part 3: Backend Development with Express

In this part, you'll build the complete backend API with Express, implementing authentication, authorization, and todo CRUD operations.

**Time Required:** 60-90 minutes

**What You'll Build:**
- Express server with middleware
- User authentication (signup/login)
- JWT token generation and verification
- Protected API endpoints
- Todo CRUD operations
- Authorization (users can only access their own data)

---

## Table of Contents
1. [Understanding the Backend Architecture](#understanding-the-backend-architecture)
2. [Building the Main Server](#building-the-main-server)
3. [Creating Authentication Endpoints](#creating-authentication-endpoints)
4. [Implementing Authentication Middleware](#implementing-authentication-middleware)
5. [Building Todo Endpoints](#building-todo-endpoints)
6. [Testing the API](#testing-the-api)

---

## Understanding the Backend Architecture

### What is a Backend?

The backend is the "server-side" of your application. It:
- Receives HTTP requests from the frontend
- Processes data and business logic
- Interacts with the database
- Sends HTTP responses back to the frontend

Think of it like a restaurant kitchen:
- **Frontend (Dining room)**: Where customers (users) interact
- **Backend (Kitchen)**: Where orders are processed and prepared
- **Database (Pantry)**: Where ingredients (data) are stored

### HTTP Request/Response Cycle

```
Frontend                    Backend                     Database
   |                           |                            |
   |  1. POST /api/auth/login  |                            |
   |  {email, password}        |                            |
   |-------------------------->|                            |
   |                           |  2. Query user by email    |
   |                           |--------------------------->|
   |                           |                            |
   |                           |  3. Return user data       |
   |                           |<---------------------------|
   |                           |                            |
   |                           |  4. Verify password        |
   |                           |     Generate JWT           |
   |                           |                            |
   |  5. {token, user}         |                            |
   |<--------------------------|                            |
```

### Express.js

Express is a minimal web framework for Node.js. It provides:
- **Routing**: Map URLs to functions
- **Middleware**: Functions that process requests
- **HTTP utilities**: Easy request/response handling

**Simple example:**
```javascript
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(3000);
```

When someone visits `http://localhost:3000/hello`, they get:
```json
{"message": "Hello, World!"}
```

### Middleware

Middleware functions run **before** your route handlers. They're like a pipeline:

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

**Common middleware:**
- **cors()**: Allows cross-origin requests
- **express.json()**: Parses JSON bodies
- **authenticateToken()**: Verifies JWT (we'll build this)

### Authentication vs Authorization

**Authentication** = Who are you?
- Login with email/password
- System verifies identity
- Issues a token proving identity

**Authorization** = What can you do?
- Checking permissions
- Ensuring users access only their own data
- Validating ownership

**Example:**
```javascript
// Authentication: Verify token, identify user
const userId = verifyToken(token);  // "You are user #5"

// Authorization: Check if user owns the todo
if (todo.userId !== userId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## Building the Main Server

### Open the Server File

Open `backend/src/index.js` in your editor.

### Add the Complete Server Code

```javascript
// Main Entry Point for Express Server
// This file sets up and starts the Express application

// Import required dependencies
// dotenv: Loads environment variables from .env file into process.env
// This must be imported first to ensure env variables are available
import dotenv from 'dotenv';
dotenv.config();

// Express: Web framework for building REST APIs
// Provides routing, middleware support, and HTTP utilities
import express from 'express';

// CORS: Cross-Origin Resource Sharing middleware
// Allows our frontend (running on different port) to make requests to this backend
// Without CORS, browsers block requests between different origins for security
import cors from 'cors';

// Import our custom route handlers
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';

// Create Express application instance
// This object represents our web server and handles all HTTP requests
const app = express();

// Get port from environment variable, default to 3000 if not set
const PORT = process.env.PORT || 3000;

// MIDDLEWARE SETUP
// Middleware functions execute in order for every request before reaching routes
// Think of them as a pipeline that processes requests

// 1. CORS Middleware
// Enables Cross-Origin Resource Sharing so frontend can communicate with backend
// Without this, browser security would block API requests from frontend
app.use(cors());

// 2. JSON Body Parser Middleware
// Automatically parses JSON data from request body and makes it available in req.body
// Example: When frontend sends {email: "user@example.com"}, we can access it via req.body.email
app.use(express.json());

// 3. URL-Encoded Body Parser Middleware
// Parses URL-encoded data (like form submissions) into req.body
// extended: true allows parsing of nested objects
app.use(express.urlencoded({ extended: true }));

// ROUTE REGISTRATION
// Routes define what happens when specific URLs are accessed

// Health Check Route
// Simple endpoint to verify server is running
// GET /health returns a JSON response confirming server status
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Authentication Routes
// All routes defined in authRoutes.js will be prefixed with /api/auth
// Example: signup route becomes /api/auth/signup
app.use('/api/auth', authRoutes);

// Todo Routes
// All routes defined in todoRoutes.js will be prefixed with /api/todos
// Example: GET todos route becomes /api/todos
app.use('/api/todos', todoRoutes);

// ERROR HANDLING MIDDLEWARE
// Catches any errors that occur in routes and sends appropriate response
// This must be defined AFTER all routes to catch their errors
app.use((err, req, res, next) => {
  // Log error to console for debugging
  console.error('Error:', err);

  // Send error response to client
  // Status code defaults to 500 (Internal Server Error) if not specified
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
});

// START SERVER
// Tells Express to start listening for HTTP requests on specified port
// Once started, server continuously runs and handles incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/todos`);
  console.log(`   - POST http://localhost:${PORT}/api/todos`);
});
```

### Understanding Each Section

**1. Environment Variables**
```javascript
import dotenv from 'dotenv';
dotenv.config();
```
- Loads `.env` file contents into `process.env`
- Must be first import so other code can access env vars
- Makes `process.env.JWT_SECRET` and `process.env.DATABASE_URL` available

**2. Middleware Order Matters**
```javascript
app.use(cors());           // 1. Handle CORS first
app.use(express.json());   // 2. Parse JSON bodies
// Routes come after middleware
```
If you put routes before `express.json()`, `req.body` will be undefined!

**3. Route Prefixes**
```javascript
app.use('/api/auth', authRoutes);
```
All routes in `authRoutes` are prefixed with `/api/auth`:
- `router.post('/signup')` becomes `/api/auth/signup`
- `router.post('/login')` becomes `/api/auth/login`

**4. Error Handler Position**
```javascript
// Routes first
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error handler last
app.use((err, req, res, next) => { /* ... */ });
```
Error handler must be registered **after** all routes to catch their errors.

---

## Creating Authentication Endpoints

Authentication endpoints allow users to sign up and log in.

### Open Authentication Routes

Open `backend/src/routes/auth.js`.

### Add the Authentication Code

```javascript
// Authentication Routes
// Handles user signup and login with JWT generation

// Import Express Router to define route handlers
import express from 'express';

// Import bcryptjs for password hashing
// bcrypt is a cryptographic hash function designed for passwords
// It's "slow by design" to make brute-force attacks impractical
import bcrypt from 'bcryptjs';

// Import jsonwebtoken for creating JWTs
import jwt from 'jsonwebtoken';

// Import Prisma client to interact with database
import prisma from '../config/prisma.js';

// Create router instance
// Router allows us to define routes in separate files and combine them
const router = express.Router();

// SIGNUP ROUTE
// POST /api/auth/signup
// Creates a new user account with email and password
router.post('/signup', async (req, res) => {
  try {
    // Extract email and password from request body
    // Frontend sends: { email: "user@example.com", password: "mypassword" }
    const { email, password } = req.body;

    // Validation: Ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validation: Ensure password meets minimum length requirement
    // Weak passwords are easily cracked by brute force or dictionary attacks
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    // findUnique queries database for a record with unique field (email)
    // Returns user object if found, null if not found
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password using bcrypt
    // Why hash passwords?
    // - Storing plain text passwords is a major security risk
    // - If database is compromised, attackers get all passwords
    // - Hashing is one-way: can't reverse hash to get original password
    //
    // How bcrypt works:
    // 1. Generates a random "salt" (random data added to password)
    // 2. Combines password + salt
    // 3. Runs through bcrypt algorithm multiple times (10 rounds here)
    // 4. Produces a hash string that includes the salt
    // 5. Each hash is unique even for same password (due to random salt)
    //
    // The "10" is the cost factor (number of rounds)
    // Higher = more secure but slower (exponential: 10 = 1024 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    // Prisma's create method:
    // 1. Inserts new row into users table
    // 2. Returns the created user object including auto-generated ID
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token for the new user
    // jwt.sign creates a token with three parts:
    // 1. Header (algorithm and token type)
    // 2. Payload (the data we want to encode - user ID in this case)
    // 3. Signature (cryptographic signature to verify authenticity)
    //
    // The payload { userId: user.id } will be accessible when token is verified
    // JWT_SECRET is used to create signature - keep this secret and secure!
    // expiresIn: token becomes invalid after 24 hours (forces re-login)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Send success response with token and user info
    // Frontend will store this token and include it in future requests
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    // Catch any unexpected errors (database connection issues, etc.)
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
});

// LOGIN ROUTE
// POST /api/auth/login
// Authenticates user and returns JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    // Returns null if user doesn't exist
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generic error message to prevent email enumeration attacks
      // Don't reveal whether email exists or password is wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password using bcrypt.compare
    // How bcrypt.compare works:
    // 1. Extracts the salt from the stored hash
    // 2. Hashes the provided password with that same salt
    // 3. Compares the new hash with stored hash
    // 4. Returns true if they match, false otherwise
    //
    // This is secure because:
    // - We never decrypt or reverse the stored hash
    // - Timing attacks are mitigated by bcrypt's design
    // - Each comparison takes ~100ms (prevents brute force)
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (same process as signup)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Send success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// Export router to be used in main app
export default router;
```

### Understanding Password Security

**Why not store plain passwords?**
```javascript
// NEVER DO THIS:
await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'mypassword123'  // Plain text = MAJOR security risk!
  }
});
```

If database is hacked, attackers have all passwords!

**bcrypt Hashing Process:**
```
Password: "mypassword123"
    ↓
bcrypt.hash(password, 10)
    ↓
Generates random salt: "$2b$10$N9qo8uLOickgx2ZMRZoMy."
    ↓
Combines and hashes 1024 times
    ↓
Output: "$2b$10$N9qo8uLOickgx2ZMRZoMy.O4jPKMo5Z5SBTM5OxSKBr3EFVaHKxVS"
```

**Same password, different hashes:**
```javascript
await bcrypt.hash('hello', 10);
// "$2b$10$abc123..."

await bcrypt.hash('hello', 10);
// "$2b$10$xyz789..."  <- Different hash!
```

This is because bcrypt uses a random salt each time.

### Understanding JWT Tokens

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjV9.abc123signature
└──────────────────────────────────┬───┴─────────────┬───┴───────────────┘
              Header                       Payload           Signature
```

**Creating a token:**
```javascript
const token = jwt.sign(
  { userId: 5 },              // Payload: data to encode
  process.env.JWT_SECRET,      // Secret key
  { expiresIn: '24h' }         // Options
);
```

**The token encodes:**
```json
{
  "userId": 5,
  "iat": 1704067200,    // Issued at (timestamp)
  "exp": 1704153600     // Expires (24h later)
}
```

**How verification works:**
```javascript
jwt.verify(token, process.env.JWT_SECRET);
// If signature is valid, returns decoded payload
// If invalid or expired, throws error
```

**Security:**
- Payload is **readable** (base64 encoded, not encrypted)
- Don't put sensitive data in token (no passwords!)
- Signature **proves authenticity** (can't be forged without secret)
- Server knows token wasn't tampered with

---

## Implementing Authentication Middleware

Middleware protects routes by verifying JWT tokens before allowing access.

### Open Middleware File

Open `backend/src/middleware/auth.js`.

### Add Authentication Middleware

```javascript
// Authentication Middleware
// This middleware protects routes by verifying JWT tokens

// Import jsonwebtoken library for JWT operations
// JWT (JSON Web Token) is a standard for securely transmitting information between parties
// A JWT contains encoded JSON data and a signature to verify authenticity
import jwt from 'jsonwebtoken';

// Authentication Middleware Function
// This function runs BEFORE protected route handlers to verify user identity
//
// How JWT Authentication Works:
// 1. User logs in with email/password
// 2. Server verifies credentials and creates a JWT containing user ID
// 3. Server sends JWT to client
// 4. Client stores JWT (usually in localStorage)
// 5. Client includes JWT in Authorization header for subsequent requests
// 6. This middleware verifies the JWT and extracts user information
// 7. If valid, request proceeds to route handler; if invalid, returns 401 error
export const authenticateToken = (req, res, next) => {
  // Extract the Authorization header from the request
  // Format expected: "Bearer <token>"
  // Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization'];

  // Extract token from "Bearer <token>" format
  // authHeader?.split(' ') splits "Bearer token" into ["Bearer", "token"]
  // [1] gets the second element (the actual token)
  // If authHeader is undefined/null, token will be undefined
  const token = authHeader && authHeader.split(' ')[1];

  // If no token provided, user is not authenticated
  // Return 401 Unauthorized status
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify the token using JWT secret
  // jwt.verify does three things:
  // 1. Checks if token signature is valid (ensures token wasn't tampered with)
  // 2. Checks if token hasn't expired (if expiration was set)
  // 3. Decodes the payload (the user data we encoded when creating the token)
  //
  // How JWT Verification Works Under the Hood:
  // - JWT has three parts: header.payload.signature (separated by dots)
  // - Signature is created by: HMACSHA256(base64(header) + "." + base64(payload), secret)
  // - To verify: recreate signature using header + payload + secret
  // - If recreated signature matches provided signature, token is valid
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // If verification fails (invalid signature, expired, malformed)
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Token is valid! Extract user information from decoded payload
    // When we created the token, we encoded { userId: user.id }
    // Now we can access that data via decoded.userId
    req.userId = decoded.userId;

    // Call next() to pass control to the next middleware or route handler
    // The route handler can now access req.userId to know who made the request
    next();
  });
};
```

### How Middleware Fits In

```
Request with JWT
    ↓
authenticateToken Middleware
    ├─ Valid token → req.userId = 5 → next() → Route handler
    └─ Invalid token → 401 error → Stop
```

**Using middleware on routes:**
```javascript
// Protect a single route
router.get('/secret', authenticateToken, (req, res) => {
  res.json({ userId: req.userId });
});

// Protect all routes in a router
router.use(authenticateToken);  // All routes below need auth
router.get('/todos', (req, res) => { /* ... */ });
router.post('/todos', (req, res) => { /* ... */ });
```

---

## Building Todo Endpoints

Now let's create the CRUD (Create, Read, Update, Delete) operations for todos.

### Open Todo Routes

Open `backend/src/routes/todos.js`.

### Add Todo CRUD Operations

```javascript
// Todo Routes
// Handles CRUD operations (Create, Read, Update, Delete) for todos

// Import Express Router
import express from 'express';

// Import Prisma client for database operations
import prisma from '../config/prisma.js';

// Import authentication middleware
// This ensures all todo routes are protected and require valid JWT
import { authenticateToken } from '../middleware/auth.js';

// Create router instance
const router = express.Router();

// Apply authentication middleware to ALL routes in this file
// This means every route below will require a valid JWT token
// The middleware extracts userId from token and adds it to req.userId
router.use(authenticateToken);

// GET ALL TODOS
// GET /api/todos
// Returns all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    // req.userId was set by authenticateToken middleware
    // This ensures users can only see their own todos
    //
    // Prisma's findMany method:
    // - Queries database for multiple records
    // - where clause filters results (similar to SQL WHERE)
    // - orderBy sorts results (newest first in this case)
    // - Returns array of todo objects
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Send todos array as JSON response
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET SINGLE TODO
// GET /api/todos/:id
// Returns a specific todo by ID (only if it belongs to the user)
router.get('/:id', async (req, res) => {
  try {
    // Extract todo ID from URL parameter
    // Example: /api/todos/5 -> req.params.id = "5"
    // parseInt converts string to number since database ID is integer
    const todoId = parseInt(req.params.id);

    // Validate ID is a valid number
    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // Find todo by ID AND userId
    // This ensures users can't access other users' todos even if they know the ID
    // findUnique is used when searching by unique identifier(s)
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Verify todo belongs to authenticated user
    // Authorization check: even if todo exists, user must own it
    if (todo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// CREATE TODO
// POST /api/todos
// Creates a new todo for the authenticated user
router.post('/', async (req, res) => {
  try {
    // Extract title from request body
    const { title } = req.body;

    // Validation: title is required
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create new todo in database
    // Prisma's create method:
    // - Inserts new row into todos table
    // - Sets userId to link todo with authenticated user
    // - completed defaults to false (defined in schema)
    // - createdAt and updatedAt automatically set by Prisma
    // - Returns the created todo object including generated ID
    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        userId: req.userId,
      },
    });

    // Return created todo with 201 status (Created)
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// UPDATE TODO
// PUT /api/todos/:id
// Updates an existing todo (title and/or completed status)
router.put('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const { title, completed } = req.body;

    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // First, check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (existingTodo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update data object
    // Only include fields that were provided in request
    // This allows partial updates (update only title, or only completed, or both)
    const updateData = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // Update todo in database
    // Prisma's update method:
    // - Finds record by ID
    // - Updates specified fields
    // - Automatically updates updatedAt timestamp
    // - Returns the updated todo object
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: updateData,
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE TODO
// DELETE /api/todos/:id
// Deletes a specific todo
router.delete('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);

    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (existingTodo.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete todo from database
    // Prisma's delete method:
    // - Removes the record from database
    // - Returns the deleted todo object (for confirmation)
    await prisma.todo.delete({
      where: { id: todoId },
    });

    // Return success message
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
```

### HTTP Status Codes

Our API uses standard HTTP status codes:

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input from client
- **401 Unauthorized**: No valid authentication
- **403 Forbidden**: Authenticated but not allowed
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

**Example:**
```javascript
// 400 - Client sent bad data
if (!title) {
  return res.status(400).json({ error: 'Title required' });
}

// 401 - No authentication token
if (!token) {
  return res.status(401).json({ error: 'Token required' });
}

// 403 - Authenticated but trying to access someone else's todo
if (todo.userId !== req.userId) {
  return res.status(403).json({ error: 'Access denied' });
}

// 404 - Todo doesn't exist
if (!todo) {
  return res.status(404).json({ error: 'Not found' });
}
```

---

## Testing the API

Now let's test our backend!

### Start the Server

```bash
# Make sure you're in backend directory
cd backend

# Start server in development mode
npm run dev
```

**You should see:**
```
🚀 Server is running on http://localhost:3000
📝 API endpoints available:
   - POST http://localhost:3000/api/auth/signup
   - POST http://localhost:3000/api/auth/login
   - GET  http://localhost:3000/api/todos
   - POST http://localhost:3000/api/todos
```

**Leave this terminal running!** The server will automatically restart when you change code (thanks to `--watch` flag).

### Test 1: Health Check

Open a new terminal and run:

```bash
# macOS/Linux
curl http://localhost:3000/health

# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3000/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

### Test 2: Signup

```bash
# macOS/Linux
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Windows PowerShell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/signup `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

**Copy the token!** You'll need it for subsequent requests.

### Test 3: Login

```bash
# macOS/Linux
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Windows PowerShell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

### Test 4: Create Todo (Protected Route)

Replace `YOUR_TOKEN_HERE` with the actual token from signup/login:

```bash
# macOS/Linux
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Learn Express"}'

# Windows PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}
$body = @{ title = "Learn Express" } | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/todos `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Expected response:**
```json
{
  "id": 1,
  "title": "Learn Express",
  "completed": false,
  "userId": 1,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### Test 5: Get All Todos

```bash
# macOS/Linux
curl http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Windows PowerShell
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN_HERE" }
Invoke-WebRequest -Uri http://localhost:3000/api/todos -Headers $headers
```

**Expected response:**
```json
[
  {
    "id": 1,
    "title": "Learn Express",
    "completed": false,
    "userId": 1,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### Test 6: Update Todo

```bash
# macOS/Linux
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"completed":true}'

# Windows PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}
$body = @{ completed = $true } | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/todos/1 `
  -Method PUT `
  -Headers $headers `
  -Body $body
```

**Expected response:**
```json
{
  "id": 1,
  "title": "Learn Express",
  "completed": true,
  "userId": 1,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:05:00.000Z"
}
```

### Test 7: Delete Todo

```bash
# macOS/Linux
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Windows PowerShell
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN_HERE" }
Invoke-WebRequest -Uri http://localhost:3000/api/todos/1 `
  -Method DELETE `
  -Headers $headers
```

**Expected response:**
```json
{"message":"Todo deleted successfully"}
```

### Test 8: Try Without Authentication

```bash
curl http://localhost:3000/api/todos
```

**Expected response:**
```json
{"error":"Access token required"}
```

This confirms protected routes require authentication!

---

## Using Postman (Alternative Testing Tool)

Postman is a GUI tool for testing APIs. It's easier than curl!

### Install Postman

Download from: https://www.postman.com/downloads/

### Create Requests

1. **Open Postman**
2. Click "New" → "HTTP Request"

**Signup:**
- Method: POST
- URL: `http://localhost:3000/api/auth/signup`
- Headers: `Content-Type: application/json`
- Body: Raw → JSON:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- Click "Send"

**Create Todo:**
- Method: POST
- URL: `http://localhost:3000/api/todos`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`
- Body: Raw → JSON:
```json
{
  "title": "Learn Postman"
}
```
- Click "Send"

---

## Common Issues

### Error: Port 3000 already in use

**Solution:**
```bash
# Find and kill process (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port in .env
PORT=3001
```

### Error: Cannot find module

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Error: DATABASE_URL not found

**Solution:**
- Check `.env` file exists in `backend/` directory
- Verify `DATABASE_URL` is defined
- Restart server after changing `.env`

### Error: JWT_SECRET not found

**Solution:**
- Add `JWT_SECRET` to `.env` file
- Restart server

### Error: User already exists

**Solution:**
- Use a different email
- Or delete existing user from Prisma Studio

### Password hash fails

**Solution:**
```bash
# Reinstall bcryptjs
npm uninstall bcryptjs
npm install bcryptjs
```

---

## Security Best Practices

### 1. Never Log Sensitive Data

**Don't:**
```javascript
console.log('Password:', password);
console.log('Token:', token);
```

**Do:**
```javascript
console.log('User authenticated:', user.id);
```

### 2. Use Strong JWT Secrets

**Bad:**
```env
JWT_SECRET=secret
JWT_SECRET=12345
```

**Good:**
```env
JWT_SECRET=8f3e9a2c1b7d6e4f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5
```

Generate secure secrets:
```bash
# macOS/Linux
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Validate All Input

```javascript
// Always validate
if (!email || !password) {
  return res.status(400).json({ error: 'Missing fields' });
}

// Trim whitespace
const title = req.body.title.trim();

// Validate format
if (!email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### 4. Use HTTPS in Production

**Development (HTTP):** `http://localhost:3000`
**Production (HTTPS):** `https://api.yourapp.com`

HTTPS encrypts data in transit - essential for production!

### 5. Implement Rate Limiting

In production, add rate limiting to prevent abuse:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests per windowMs
});

app.use('/api/auth', limiter);
```

---

## Checkpoint

At this point, you should have:
- [ ] Complete Express server running on port 3000
- [ ] Authentication endpoints (signup/login) working
- [ ] JWT token generation and verification
- [ ] Protected todo endpoints requiring authentication
- [ ] All CRUD operations working (Create, Read, Update, Delete)
- [ ] Authorization ensuring users can only access their own data
- [ ] API tested with curl or Postman

**Verify:**
```bash
# Server is running
curl http://localhost:3000/health

# Can create user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@test.com","password":"test123"}'

# Can login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@test.com","password":"test123"}'
```

---

## What's Next?

Fantastic work! You've built a complete, secure backend API.

In **Part 4**, we'll:
- Build the React frontend
- Create authentication UI
- Implement todo list interface
- Connect frontend to backend API
- Manage state with React Context

**Keep your backend server running** - we'll need it for the frontend to work!

When ready, open **TUTORIAL-PART-4-FRONTEND.md**!

---

## Quick Reference

**Start server:**
```bash
cd backend
npm run dev
```

**API Endpoints:**
```
POST   /api/auth/signup   - Create account
POST   /api/auth/login    - Login
GET    /api/todos         - Get all todos (requires auth)
POST   /api/todos         - Create todo (requires auth)
GET    /api/todos/:id     - Get one todo (requires auth)
PUT    /api/todos/:id     - Update todo (requires auth)
DELETE /api/todos/:id     - Delete todo (requires auth)
```

**Authorization Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

Keep this open for reference!
