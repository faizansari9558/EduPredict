import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';

export default function PublicHeader() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-6 sm:px-10 lg:px-12 flex items-center justify-between gap-4">
        {/* Left: EduPredict Logo (Prominent & Clear) */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center" aria-label="EduPredict Home">
            <Logo variant="light" size="md" />
          </Link>
        </div>

        {/* Middle: Navigation Links */}
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

        {/* Right: Sign In & Register Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm" icon="login">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon="person_add">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
