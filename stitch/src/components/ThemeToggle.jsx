import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/30 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="material-symbols-outlined text-[20px] text-secondary transition-transform duration-300 hover:rotate-45">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-xs font-semibold capitalize hidden sm:inline">
          {isDark ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </button>
  );
}
