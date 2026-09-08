import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/**
 * Stitch Main Layout Shell
 * Integrates fixed Sidebar, sticky Topbar, and responsive data workspace
 */
export default function MainLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive active role from URL pathname
  const getRole = () => {
    if (location.pathname.startsWith('/teacher')) return 'teacher';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'student';
  };

  const currentRole = getRole();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar
        role={currentRole}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Topbar Header */}
        <Navbar
          role={currentRole}
          collapsed={collapsed}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto pt-22 px-4 sm:px-6 lg:px-8 pb-12">
          <Outlet />
        </main>

        {/* Institutional Footer */}
        <footer className="mt-auto py-6 px-6 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EduPredict • Smart Student Academic &amp; Placement Prediction System</span>
          <span className="font-mono text-[11px] text-outline">Stitch UI v2.4 • Tailwind CSS v4</span>
        </footer>
      </div>
    </div>
  );
}
