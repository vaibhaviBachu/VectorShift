// ThemeToggle.js — switches between light and dark themes.

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { getInitialTheme, applyTheme } from '../lib/theme';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      className="vs-theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle color theme"
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
};
