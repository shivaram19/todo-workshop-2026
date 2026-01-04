# Part 4: Frontend Development with React

In this part, you'll build the complete React frontend that communicates with your backend API.

**Time Required:** 60-90 minutes

**What You'll Build:**
- React application with Vite
- Authentication UI (login/signup)
- Todo list interface
- API integration
- State management with Context API
- Responsive UI components

---

## Table of Contents
1. [Understanding React Basics](#understanding-react-basics)
2. [Setting Up the Frontend Project](#setting-up-the-frontend-project)
3. [Creating the API Client](#creating-the-api-client)
4. [Building Authentication Context](#building-authentication-context)
5. [Creating the Auth Component](#creating-the-auth-component)
6. [Building the TodoList Component](#building-the-todolist-component)
7. [Creating the Main App](#creating-the-main-app)
8. [Testing the Application](#testing-the-application)

---

## Understanding React Basics

### What is React?

React is a JavaScript library for building user interfaces. It lets you create reusable components that manage their own state.

**Key Concepts:**

**1. Components** - Building blocks of your UI
```jsx
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

**2. JSX** - HTML-like syntax in JavaScript
```jsx
const element = <div className="container">Hello</div>;
```

**3. State** - Data that changes over time
```jsx
const [count, setCount] = useState(0);
```

**4. Props** - Data passed to components
```jsx
<Welcome name="Alice" />
```

### React Hooks

Hooks are functions that let you use React features:

**useState** - Manage component state
```jsx
const [email, setEmail] = useState('');
// email is current value
// setEmail is function to update it
```

**useEffect** - Run code after render
```jsx
useEffect(() => {
  // This runs after component renders
  fetchData();
}, []); // Empty array = run once
```

**useContext** - Access shared state
```jsx
const { user, token } = useAuth();
```

### How React Works

```
State Changes → React Re-renders → UI Updates
```

Example:
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

When button is clicked:
1. `setCount(count + 1)` is called
2. React re-renders component
3. UI shows new count

---

## Setting Up the Frontend Project

### Navigate to Frontend Directory

```bash
# From project root
cd frontend

# Or from backend
cd ../frontend
```

### Install Additional Dependencies

```bash
# Install Lucide React for icons
npm install lucide-react
```

### Project Structure

Your frontend should look like:
```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── Auth.jsx
│   │   └── TodoList.jsx
│   ├── contexts/         # Context providers
│   │   └── AuthContext.jsx
│   ├── utils/           # Helper functions
│   │   └── api.js
│   ├── App.jsx          # Main component
│   ├── main.jsx         # Entry point
│   └── index.css        # Styles
├── index.html           # HTML template
├── package.json
└── vite.config.js
```

### Create Missing Directories

```bash
# In frontend/src directory
mkdir components contexts utils

# macOS/Linux
touch src/components/Auth.jsx
touch src/components/TodoList.jsx
touch src/contexts/AuthContext.jsx
touch src/utils/api.js

# Windows PowerShell
New-Item -ItemType File -Path src/components/Auth.jsx
New-Item -ItemType File -Path src/components/TodoList.jsx
New-Item -ItemType File -Path src/contexts/AuthContext.jsx
New-Item -ItemType File -Path src/utils/api.js
```

---

## Creating the API Client

The API client centralizes all backend communication.

### Open api.js

Open `frontend/src/utils/api.js`.

### Add API Client Code

```javascript
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
```

### Understanding the Fetch API

**Basic fetch:**
```javascript
fetch('http://localhost:3000/api/todos')
  .then(response => response.json())
  .then(data => console.log(data));
```

**With async/await:**
```javascript
const response = await fetch('http://localhost:3000/api/todos');
const data = await response.json();
console.log(data);
```

**With headers:**
```javascript
fetch('http://localhost:3000/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ title: 'New todo' })
});
```

### Why Centralize API Calls?

**Without centralization:**
```javascript
// In every component:
const response = await fetch('http://localhost:3000/api/todos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
if (!response.ok) throw new Error(data.error);
```

**With centralization:**
```javascript
// In component:
const todos = await getTodos(token);
```

Benefits:
- DRY (Don't Repeat Yourself)
- Easy to update API URL
- Consistent error handling
- Type safety (with TypeScript)

---

## Building Authentication Context

Context provides global state management for authentication.

### Open AuthContext.jsx

Open `frontend/src/contexts/AuthContext.jsx`.

### Add Context Code

```javascript
// Authentication Context
// Manages authentication state across the entire application using React Context API

// Import React hooks
// createContext: Creates a context object for sharing data across components
// useContext: Hook to access context data in child components
// useState: Hook for managing component state
// useEffect: Hook for side effects (like checking localStorage on mount)
import { createContext, useContext, useState, useEffect } from 'react';

// Create the Authentication Context
// createContext creates a special object that can hold and distribute data
// We initialize with undefined and will provide actual values in the Provider
//
// How React Context works:
// 1. Create a Context object (this line)
// 2. Create a Provider component that wraps app (AuthProvider below)
// 3. Provider holds the actual state and functions
// 4. Any child component can access this data using useContext hook
// 5. When context value changes, all consuming components re-render
const AuthContext = createContext(undefined);

// Custom hook to access auth context
// This provides a convenient way to use the context
// Components call: const { user, token, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Ensure hook is used within AuthProvider
  // If used outside, context will be undefined and we throw an error
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// AuthProvider Component
// Wraps the application and provides authentication state to all children
// Props:
// - children: Child components to render inside the provider
export const AuthProvider = ({ children }) => {
  // State for storing current user information
  // null means no user is logged in
  // User object shape: { id: number, email: string }
  const [user, setUser] = useState(null);

  // State for storing JWT token (string or null)
  const [token, setToken] = useState(null);

  // Loading state to handle initial authentication check
  // Prevents flash of login screen while checking for existing session
  const [loading, setLoading] = useState(true);

  // Effect hook to check for existing authentication on component mount
  // This runs once when app first loads
  //
  // Why we need this:
  // - User might have logged in previously
  // - JWT token is stored in localStorage
  // - When user returns, we restore their session from localStorage
  // - Without this, user would have to log in again every page refresh
  useEffect(() => {
    // Try to retrieve stored authentication data from localStorage
    // localStorage is browser API that persists data across page reloads
    // Unlike sessionStorage, data persists even after browser is closed
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // If both token and user data exist, restore the session
    if (storedToken && storedUser) {
      try {
        // Parse user JSON string back into object
        // localStorage only stores strings, so we need to parse JSON
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        // If JSON parsing fails (corrupted data), clear invalid data
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Set loading to false - we're done checking for existing session
    setLoading(false);
  }, []); // Empty dependency array means this runs once on mount

  // Login function
  // Called when user successfully authenticates via login or signup
  // Stores credentials in both state (for current session) and localStorage (for persistence)
  // Parameters:
  // - newToken: JWT token string
  // - newUser: User object { id, email }
  const login = (newToken, newUser) => {
    // Update React state
    // This causes re-render and updates UI immediately
    setToken(newToken);
    setUser(newUser);

    // Persist to localStorage
    // This ensures session survives page refreshes
    // JSON.stringify converts object to string for storage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Logout function
  // Clears all authentication data from state and localStorage
  const logout = () => {
    // Clear React state
    setToken(null);
    setUser(null);

    // Clear localStorage
    // This ensures user won't be automatically logged back in
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Context value object
  // This is what consuming components will receive via useAuth()
  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  // Render Provider component with value
  // Provider makes the value available to all child components
  // Any component in the tree can access this data using useAuth()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Understanding Context Pattern

**Without Context (Prop Drilling):**
```jsx
<App user={user}>
  <Header user={user}>
    <Profile user={user} />
  </Header>
  <TodoList user={user}>
    <TodoItem user={user} />
  </TodoList>
</App>
```

**With Context:**
```jsx
<AuthProvider>
  <App>
    <Header>
      <Profile />  {/* Can access user via useAuth() */}
    </Header>
    <TodoList>
      <TodoItem />  {/* Can access user via useAuth() */}
    </TodoList>
  </App>
</AuthProvider>
```

---

## Creating the Auth Component

The Auth component handles login and signup.

### Open Auth.jsx

Open `frontend/src/components/Auth.jsx`.

### Add Auth Component Code

```javascript
// Authentication Component
// Handles user login and signup with form validation

// Import React hooks
// useState: Manages component state (form inputs, errors, loading)
import { useState } from 'react';

// Import authentication context to access login function
import { useAuth } from '../contexts/AuthContext';

// Import API functions for backend communication
import { login as apiLogin, signup as apiSignup } from '../utils/api';

// Auth Component
// Provides UI for both login and signup
// Uses a toggle to switch between modes
export const Auth = () => {
  // Component State Management

  // Toggle between login and signup mode
  const [isLogin, setIsLogin] = useState(true);

  // Form input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error message from API or validation
  const [error, setError] = useState('');

  // Loading state during API request
  // Prevents double-submission and shows feedback to user
  const [loading, setLoading] = useState(false);

  // Get login function from auth context
  // This will update global auth state and store token
  const { login } = useAuth();

  // Form submission handler
  // Handles both login and signup based on current mode
  //
  // async/await explanation:
  // - API calls return Promises (eventual completion of async operation)
  // - await pauses execution until Promise resolves
  // - Makes async code look synchronous and easier to read
  // - Errors can be caught with try-catch instead of .catch()
  //
  // Parameter:
  // - e: Event object from form submission
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior
    // By default, forms cause page reload when submitted
    // We want to handle submission with JavaScript instead
    e.preventDefault();

    // Clear any previous errors
    setError('');

    // Client-side validation
    // Catch errors before making API request for better UX
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Email format validation using regex
    // Simple check for @ symbol and domain
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Set loading state
    // This disables the submit button and shows loading indicator
    setLoading(true);

    try {
      // Make API request based on current mode
      // Both functions return { token, user } on success
      const response = isLogin
        ? await apiLogin(email, password)
        : await apiSignup(email, password);

      // Update global auth state with token and user data
      // This will trigger re-render of entire app
      // Components checking auth state will now see user is logged in
      login(response.token, response.user);

      // No need to redirect - App component will handle this
      // When user is set in context, App will render TodoList instead of Auth
    } catch (err) {
      // Catch any errors from API request
      // err is Error object with message property
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      // finally block always runs, regardless of success or error
      // Used for cleanup - we want to stop loading state either way
      setLoading(false);
    }
  };

  // Render authentication form
  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

      {/* Error message display - only shown if error exists */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Authentication form */}
      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            // onChange fires every time input value changes
            // e.target.value contains the new input value
            // We update state which causes re-render with new value
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Password input */}
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {/* Toggle between login and signup */}
      <button onClick={() => setIsLogin(!isLogin)} disabled={loading}>
        {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
      </button>
    </div>
  );
};
```

### Understanding Form Handling

**Controlled Components:**
```jsx
const [email, setEmail] = useState('');

<input
  value={email}                          // React controls value
  onChange={(e) => setEmail(e.target.value)}  // Update state on change
/>
```

React state is the "source of truth" for input value.

**Uncontrolled (don't use for forms):**
```jsx
<input ref={inputRef} />
// Access with inputRef.current.value
```

**Form Submission:**
```jsx
const handleSubmit = (e) => {
  e.preventDefault();  // Stop page reload
  // Handle form data
};

<form onSubmit={handleSubmit}>
```

---

## Building the TodoList Component

The TodoList displays and manages todos.

### Open TodoList.jsx

Open `frontend/src/components/TodoList.jsx`.

### Add TodoList Code

Due to length, here's the complete file:

```javascript
// TodoList Component
// Displays and manages user's todo items with full CRUD functionality

// Import React hooks
// useState: Manages component state
// useEffect: Runs side effects (like fetching data on mount)
import { useState, useEffect } from 'react';

// Import auth context to get current user and token
import { useAuth } from '../contexts/AuthContext';

// Import API functions for todo operations
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../utils/api';

// Import icon for delete button
import { Trash2 } from 'lucide-react';

// TodoList Component
export const TodoList = () => {
  // Component State

  // Array of all todos
  // Each todo object shape: { id, title, completed, userId, createdAt, updatedAt }
  const [todos, setTodos] = useState([]);

  // Input value for new todo
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  // Error message for display
  const [error, setError] = useState('');

  // Get auth data from context
  const { token, user, logout } = useAuth();

  // Fetch todos when component mounts
  // useEffect with empty dependency array runs once after first render
  //
  // Component lifecycle:
  // 1. Component renders with initial state (empty todos, loading true)
  // 2. useEffect runs after render
  // 3. Fetches todos from API
  // 4. Updates state with todos
  // 5. Component re-renders with loaded todos
  useEffect(() => {
    fetchTodos();
  }, []); // Empty array = run once on mount

  // Fetch todos from backend
  const fetchTodos = async () => {
    // Safety check - should never happen due to App.jsx logic
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      // Call API to get todos
      // Backend filters todos by user ID extracted from token
      const data = await getTodos(token);

      // Update state with fetched todos
      // This triggers re-render and displays todos
      setTodos(data);
    } catch (err) {
      // Handle errors (network issues, invalid token, etc.)
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      // Always stop loading, whether successful or not
      setLoading(false);
    }
  };

  // Create new todo
  // Parameter:
  // - e: Event object from form submission
  const handleCreateTodo = async (e) => {
    // Prevent form submission page reload
    e.preventDefault();

    // Validate input
    if (!newTodoTitle.trim()) {
      setError('Please enter a todo title');
      return;
    }

    if (!token) return;

    try {
      setError('');

      // Call API to create todo
      // Backend returns the created todo with generated ID
      const newTodo = await createTodo(token, newTodoTitle);

      // Optimistic UI update
      // Add new todo to state immediately without refetching all todos
      // This makes UI feel faster and more responsive
      //
      // We prepend new todo to array so it appears at top
      // [newTodo, ...todos] creates new array with newTodo first, then existing todos
      setTodos([newTodo, ...todos]);

      // Clear input field
      setNewTodoTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  // Toggle todo completed status
  // Parameter:
  // - todo: The todo object to toggle
  const handleToggleTodo = async (todo) => {
    if (!token) return;

    try {
      setError('');

      // Call API to update todo
      // We only update the completed field
      const updatedTodo = await updateTodo(token, todo.id, {
        completed: !todo.completed,
      });

      // Update state with modified todo
      // map creates new array by transforming each element
      // When we find matching todo, replace it with updated version
      // All other todos remain unchanged
      //
      // Why we create new array instead of mutating:
      // - React requires immutability for state updates
      // - React compares references to detect changes
      // - Mutating array directly won't trigger re-render
      setTodos(
        todos.map((t) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  // Delete todo
  // Parameter:
  // - id: The ID of the todo to delete
  const handleDeleteTodo = async (id) => {
    if (!token) return;

    try {
      setError('');

      // Call API to delete todo
      await deleteTodo(token, id);

      // Remove todo from state
      // filter creates new array with only items that pass the test
      // We keep all todos except the one being deleted
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  // Show loading state
  if (loading) {
    return <div>Loading todos...</div>;
  }

  // Render todo list UI
  return (
    <div>
      {/* Header with user info and logout button */}
      <div>
        <h1>My Todos</h1>
        <div>
          <span>Logged in as: {user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Error message display */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Form to create new todo */}
      <form onSubmit={handleCreateTodo}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>

      {/* Todo list */}
      <div>
        {todos.length === 0 ? (
          <p>No todos yet. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* Map over todos array to render each todo
                map is a JavaScript array method that creates new array
                by calling a function for each element
                In React, we use map to render lists of components */}
            {todos.map((todo) => (
              // Key prop is required for list items in React
              // Helps React identify which items changed, added, or removed
              // Should be unique and stable (ID is perfect)
              <li key={todo.id} style={{ marginBottom: '10px' }}>
                {/* Checkbox to toggle completed status
                    checked attribute sets checkbox state
                    onChange fires when user clicks checkbox */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                />

                {/* Todo title with strikethrough if completed
                    Conditional styling: if completed, apply textDecoration */}
                <span
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginLeft: '10px',
                    marginRight: '10px',
                  }}
                >
                  {todo.title}
                </span>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={18} color="red" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary statistics */}
      <div>
        <p>
          Total: {todos.length} | Completed:{' '}
          {/* filter returns array of completed todos, length gives count */}
          {todos.filter((t) => t.completed).length} | Pending:{' '}
          {todos.filter((t) => !t.completed).length}
        </p>
      </div>
    </div>
  );
};
```

### Understanding Array Methods

**map** - Transform array elements
```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
// [2, 4, 6]

// In React:
{todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
```

**filter** - Keep elements that pass test
```javascript
const numbers = [1, 2, 3, 4];
const even = numbers.filter(n => n % 2 === 0);
// [2, 4]

// Remove deleted todo:
setTodos(todos.filter(t => t.id !== deletedId));
```

**find** - Get first matching element
```javascript
const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
const alice = users.find(u => u.id === 1);
// {id: 1, name: 'Alice'}
```

---

## Creating the Main App

The App component ties everything together.

### Open App.jsx

Open `frontend/src/App.jsx` and replace its contents:

```javascript
// Main App Component
// Entry point that manages authentication flow and renders appropriate UI

// Import authentication context and hook
// AuthProvider wraps entire app to provide auth state to all components
// useAuth hook allows us to access current authentication state
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import authentication and todo components
import { Auth } from './components/Auth';
import { TodoList } from './components/TodoList';

// AppContent Component
// This component uses useAuth, so it must be INSIDE AuthProvider
// Renders different UI based on authentication state
//
// Why separate component?
// - useAuth can only be called inside AuthProvider
// - App component renders AuthProvider
// - We need another component inside Provider to use useAuth hook
function AppContent() {
  // Get authentication state from context
  const { user, loading } = useAuth();

  // Show loading state while checking for existing session
  // This prevents flash of login screen if user is already logged in
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Conditional rendering based on authentication state
  // If user exists, show todo list
  // If no user, show login/signup form
  //
  // This is the core of authentication-based routing:
  // - No complex routing library needed for simple apps
  // - Authentication state determines what user sees
  // - When user logs in, context updates and component re-renders with TodoList
  // - When user logs out, context updates and component re-renders with Auth
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      {user ? <TodoList /> : <Auth />}
    </div>
  );
}

// Main App Component
// Wraps entire application with AuthProvider
function App() {
  return (
    // AuthProvider makes auth state available to all child components
    // This is the top-level context that manages authentication for entire app
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

### Understanding Component Hierarchy

```
App
└── AuthProvider (provides auth state)
    └── AppContent (uses auth state)
        ├── Auth (if not logged in)
        └── TodoList (if logged in)
```

---

## Testing the Application

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Test the Application

1. **Open browser** to http://localhost:5173/

2. **Sign up**:
   - Click "Need an account? Sign up"
   - Enter email: `demo@example.com`
   - Enter password: `password123`
   - Click "Sign Up"

3. **Create todos**:
   - Enter "Buy groceries"
   - Click "Add Todo"
   - Add more todos

4. **Toggle completed**:
   - Click checkboxes to mark complete
   - Notice strikethrough styling

5. **Delete todo**:
   - Click red trash icon

6. **Logout**:
   - Click "Logout" button
   - Should see login screen

7. **Login**:
   - Enter same credentials
   - Should see your todos still there!

### Browser DevTools

Open Developer Tools (F12) to:

**Console Tab:**
- See any errors
- Check API requests

**Network Tab:**
- See HTTP requests to backend
- Check request/response data
- Verify authentication headers

**Application Tab:**
- Check localStorage
- See stored token and user data

---

## Common Issues

### Error: Cannot connect to backend

**Cause:** Backend not running

**Solution:**
```bash
# Start backend
cd backend
npm run dev
```

### Error: CORS

**Cause:** CORS not configured

**Solution:** Verify `backend/src/index.js` has:
```javascript
import cors from 'cors';
app.use(cors());
```

### Blank page

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Fix any import errors

### Login doesn't work

**Solution:**
1. Open Network tab
2. Check API request
3. Verify backend is responding
4. Check token is being stored in localStorage

### Todos not showing

**Solution:**
1. Check Network tab for `/api/todos` request
2. Verify Authorization header includes token
3. Check backend terminal for errors

---

## Checkpoint

At this point, you should have:
- [ ] Complete React frontend running on port 5173
- [ ] Authentication UI working (login/signup)
- [ ] Todo list displaying
- [ ] CRUD operations working (create, toggle, delete)
- [ ] Authentication persisting across page refresh
- [ ] Proper error handling and loading states

---

## What's Next?

Great job! Your todo app is fully functional.

In **Part 5**, we'll:
- Add Tailwind CSS for beautiful styling
- Improve the UI design
- Make it responsive
- Add animations and transitions

Open **TUTORIAL-PART-5-STYLING.md** when ready!

---

## Quick Reference

**Start frontend:**
```bash
cd frontend
npm run dev
```

**Component hierarchy:**
- App.jsx - Main component
- AuthContext.jsx - Global auth state
- Auth.jsx - Login/signup form
- TodoList.jsx - Todo interface
- api.js - Backend communication

**React hooks used:**
- useState - Component state
- useEffect - Side effects
- useContext - Access context

**Key concepts:**
- Components render based on state
- Props pass data down
- Context shares data globally
- Immutable state updates trigger re-renders

Keep this open for reference!
