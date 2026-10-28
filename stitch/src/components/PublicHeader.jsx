import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

export default function PublicHeader() {
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Left: EduPredict Logo (Prominent & Clear) */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center" aria-label="EduPredict Home">
            <Logo size="md" />
          </Link>
        </div>

        {/* Middle: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-on-surface-variant">
          <Link
            to="/"
            className={`transition-colors hover:text-primary ${path === '/' ? 'text-secondary font-bold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-primary ${path === '/about' ? 'text-secondary font-bold' : ''}`}
          >
            About
          </Link>
          <Link
            to="/help"
            className={`transition-colors hover:text-primary ${path === '/help' ? 'text-secondary font-bold' : ''}`}
          >
            Help & FAQ
          </Link>
          <Link
            to="/contact"
            className={`transition-colors hover:text-primary ${path === '/contact' ? 'text-secondary font-bold' : ''}`}
          >
            Contact Us
          </Link>
          <Link
            to="/privacy"
            className={`transition-colors hover:text-primary ${path === '/privacy' ? 'text-secondary font-bold' : ''}`}
          >
            Privacy
          </Link>
        </nav>

        {/* Right: Theme Toggle, Sign In & Register Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Button to="/login" variant="outline" size="sm" icon="login">
            Sign In
          </Button>

          <Button to="/register" variant="primary" size="sm" icon="person_add">
            Register
          </Button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface px-6 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-on-surface-variant">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-container-high transition-colors ${path === '/' ? 'text-secondary font-bold bg-surface-container-low' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-container-high transition-colors ${path === '/about' ? 'text-secondary font-bold bg-surface-container-low' : ''}`}
            >
              About
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-container-high transition-colors ${path === '/help' ? 'text-secondary font-bold bg-surface-container-low' : ''}`}
            >
              Help & FAQ
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-container-high transition-colors ${path === '/contact' ? 'text-secondary font-bold bg-surface-container-low' : ''}`}
            >
              Contact Us
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg hover:bg-surface-container-high transition-colors ${path === '/privacy' ? 'text-secondary font-bold bg-surface-container-low' : ''}`}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
