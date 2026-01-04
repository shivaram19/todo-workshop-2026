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
