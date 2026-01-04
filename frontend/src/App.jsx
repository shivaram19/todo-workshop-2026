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
