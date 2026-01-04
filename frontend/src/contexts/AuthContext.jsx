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
