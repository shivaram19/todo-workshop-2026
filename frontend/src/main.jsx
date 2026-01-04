// Main Entry Point
// This file is the first JavaScript file that runs in the browser
// It mounts the React application to the DOM

// Import React's StrictMode component
// StrictMode helps identify potential problems in the application during development
// It activates additional checks and warnings for its descendants
// StrictMode does NOT render any visible UI - it's just for development checks
import { StrictMode } from 'react';

// Import createRoot from react-dom/client
// createRoot is the modern way to mount a React app (React 18+)
// It enables concurrent features and improves performance
import { createRoot } from 'react-dom/client';

// Import the main App component
import App from './App.jsx';

// Import global CSS styles
import './index.css';

// Mount the React application
// 1. document.getElementById('root') - Get the root div from index.html
// 2. createRoot() - Create a root React node at that DOM element
// 3. render() - Render the React component tree into the root
//
// The ! in TypeScript would assert non-null, but in JS we trust the element exists
// If root element doesn't exist, this will throw an error (which is correct behavior)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
