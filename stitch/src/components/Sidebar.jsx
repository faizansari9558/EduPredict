import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

/**
 * Stitch Official Navigation Sidebar
 * Role-adaptive for Student, Teacher, and Admin personas
 */
export default function Sidebar({
  role = 'student',
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}) {
  const getNavItems = () => {
    switch (role) {
      case 'teacher':
        return [
          { to: '/teacher/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { to: '/teacher/students', label: 'Assigned Students', icon: 'group' },
          { to: '/teacher/verification', label: 'Verification Hub', icon: 'verified_user', badge: '7' },
          { to: '/teacher/assessments', label: 'Assessments', icon: 'assignment' },
          { to: '/teacher/results', label: 'Class Results', icon: 'query_stats' },
          { to: '/teacher/analytics', label: 'Cohort Analytics', icon: 'analytics', badge: 'AI', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
          { to: '/teacher/notifications', label: 'Notifications', icon: 'notifications' }
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: 'dashboard' },
          { to: '/admin/users', label: 'User Directory', icon: 'manage_accounts' },
          { to: '/admin/departments', label: 'Departments', icon: 'apartment' },
          { to: '/admin/analytics', label: 'Institutional Analytics', icon: 'insights', badge: 'AI', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
          { to: '/admin/reports', label: 'Reports & Exports', icon: 'download' },
          { to: '/admin/notifications', label: 'System Alerts', icon: 'notifications' }
        ];
      case 'student':
      default:
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { to: '/student/profile', label: 'Profile', icon: 'person' },
          { to: '/student/academic-records', label: 'Academic Records', icon: 'school' },
          { to: '/student/skills', label: 'Skills & Mastery', icon: 'psychology' },
          { to: '/student/projects', label: 'Projects', icon: 'terminal' },
          { to: '/student/certifications', label: 'Certifications', icon: 'verified' },
          { to: '/student/internships', label: 'Internships', icon: 'work' },
          { to: '/student/resume', label: 'Resume ATS AI', icon: 'description', badge: 'AI', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
          { to: '/student/assessments', label: 'Assessments Hub', icon: 'assignment' },
          { to: '/student/results', label: 'Results & Ranks', icon: 'query_stats' },
          { to: '/student/placement-analysis', label: 'Placement Analysis', icon: 'model_training', badge: 'AI', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
          { to: '/student/notifications', label: 'Notifications', icon: 'notifications', badge: '3' }
        ];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Brand Header */}
      <div className="flex flex-col min-h-0">
        <div className="h-17 px-4 flex items-center justify-between bg-primary/25 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo theme="dark" size="sm" linkTo="/" />
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-white/10 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {collapsed ? 'menu_open' : 'keyboard_double_arrow_left'}
              </span>
            </button>
          )}
        </div>

        {/* Role Badge */}
        <div className="px-4 py-2 bg-primary/10 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
            {role.toUpperCase()} PORTAL
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tertiary-fixed/20 text-tertiary-fixed font-bold">
            v2.4
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-secondary text-on-secondary font-semibold shadow-sm'
                    : 'text-on-primary-container hover:bg-white/10 hover:text-on-primary'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                {item.icon}
              </span>
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-error text-on-error'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-white/5 bg-primary/20 space-y-1">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/20 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!collapsed && <span>Switch / Sign Out</span>}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-primary-container text-on-primary z-40 flex-col transition-all duration-300 shadow-[0_1px_8px_rgba(0,0,0,0.08)] ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-primary-container text-on-primary flex flex-col shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
