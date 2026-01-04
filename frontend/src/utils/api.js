// API Utility Functions
// Centralized functions for making HTTP requests to backend

// Base URL for API requests
// In development, backend runs on port 3000
// This could be configured via environment variable for different environments
const API_URL = 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
// This function wraps the native fetch API to add common functionality
//
// How fetch API works:
// 1. Makes HTTP request to specified URL
// 2. Returns a Promise that resolves to Response object
// 3. Response contains status code, headers, and body
// 4. We need to call .json() on response to parse JSON body
//
// Why we need this wrapper:
// - Adds consistent error handling
// - Automatically includes authentication token
// - Parses JSON responses
// - Throws descriptive errors for non-200 responses
//
// Parameters:
// - url: The URL to fetch (string)
// - options: Fetch options object (method, headers, body, etc.)
const fetchWrapper = async (url, options = {}) => {
  // Make HTTP request using fetch
  const response = await fetch(url, {
    // Merge provided options with defaults
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Spread any additional headers provided by caller
      ...options.headers,
    },
  });

  // Parse JSON response body
  // response.json() returns a Promise that resolves to parsed JavaScript object
  const data = await response.json();

  // Check if request was successful (status code 200-299)
  if (!response.ok) {
    // Throw error with message from server
    // The error will be caught by try-catch blocks in components
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// Authentication API Functions

// Signup function
// Sends POST request to create new user account
// Parameters:
// - email: User's email address (string)
// - password: User's password (string)
// Returns: { token, user }
export const signup = async (email, password) => {
  return fetchWrapper(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Login function
// Sends POST request to authenticate user
// Parameters:
// - email: User's email address (string)
// - password: User's password (string)
// Returns: { token, user }
export const login = async (email, password) => {
  return fetchWrapper(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Todo API Functions
// All these functions require authentication token

// Get all todos for current user
// Token is passed in Authorization header
// Backend middleware extracts user ID from token
// Parameters:
// - token: JWT token (string)
// Returns: Array of todo objects
export const getTodos = async (token) => {
  return fetchWrapper(`${API_URL}/todos`, {
    headers: {
      // Bearer token authentication standard
      // Format: "Bearer <token>"
      Authorization: `Bearer ${token}`,
    },
  });
};

// Create new todo
// Sends todo title to backend
// Backend automatically associates todo with authenticated user
// Parameters:
// - token: JWT token (string)
// - title: Todo title (string)
// Returns: Created todo object
export const createTodo = async (token, title) => {
  return fetchWrapper(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
};

// Update existing todo
// Can update title, completed status, or both
// Parameters:
// - token: JWT token (string)
// - id: Todo ID (number)
// - updates: Object with optional title and/or completed fields
// Returns: Updated todo object
export const updateTodo = async (token, id, updates) => {
  return fetchWrapper(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
};

// Delete todo
// Parameters:
// - token: JWT token (string)
// - id: Todo ID (number)
// Returns: Success message
export const deleteTodo = async (token, id) => {
  return fetchWrapper(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
