// theme.js — light/dark theme helpers, persisted to localStorage.

const STORAGE_KEY = 'vs-theme';

export const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // Fall back to the OS preference.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
};
