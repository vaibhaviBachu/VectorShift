import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { getInitialTheme, applyTheme } from './lib/theme';

// Apply the saved theme before first paint to avoid a flash of light mode.
applyTheme(getInitialTheme());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
