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
