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
