import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Stitch Official Topbar Header
 * Includes Predictive Search, Academic Session Filter, Persona Switcher, & Notifications
 */
export default function Navbar({
  role = 'student',
  user,
  collapsed = false,
  onOpenMobileMenu
}) {
  const navigate = useNavigate();
  const [sessionOpen, setSessionOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024 - 2025');

  const personas = [
    { role: 'student', label: 'Faiz Ansari (Student)', path: '/student/dashboard', email: 'faiz.ansari@edupredict.edu' },
    { role: 'teacher', label: 'Dr. Anand Sharma (Faculty)', path: '/teacher/dashboard', email: 'sharma@edupredict.local' },
    { role: 'admin', label: 'System Admin (Dean Office)', path: '/admin/dashboard', email: 'admin@edupredict.local' }
  ];

  const currentPersona = personas.find((p) => p.role === role) || personas[0];

  return (
    <header
      className={`fixed top-0 right-0 h-17 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${
        collapsed ? 'left-0 lg:left-18' : 'left-0 lg:left-64'
      }`}
    >
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Open mobile menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative flex items-center flex-1">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search anything... courses, tests, analytics, skills"
            className="w-full h-10 pl-10 pr-12 bg-surface-container-low rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-transparent focus:border-secondary/40"
          />
          <div className="hidden sm:flex absolute right-2.5 items-center pointer-events-none">
            <kbd className="text-[10px] font-mono font-bold bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Academic Session, Notifications, User Persona Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Session Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setSessionOpen(!sessionOpen)}
            className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-outline text-[16px]">
              calendar_today
            </span>
            <span>{selectedYear}</span>
            <span className="material-symbols-outlined text-outline text-[16px]">
              expand_more
            </span>
          </button>

          {sessionOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-1 z-50 animate-fade-in">
              {['2024 - 2025', '2023 - 2024', '2022 - 2023'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    setSelectedYear(yr);
                    setSessionOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    selectedYear === yr
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-outline-variant/40 mx-1 hidden sm:block" />

        {/* Quick Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold ring-2 ring-secondary/20">
              {role === 'student' ? 'FA' : role === 'teacher' ? 'AS' : 'AD'}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-on-surface">
                {currentPersona.label.split(' (')[0]}
              </span>
              <span className="text-[10px] font-semibold text-secondary capitalize">
                {role} Mode ▾
              </span>
            </div>
          </button>

          {personaOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-outline-variant/30 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Switch Portal Persona
                </span>
              </div>
              {personas.map((p) => (
                <button
                  key={p.role}
                  onClick={() => {
                    setPersonaOpen(false);
                    navigate(p.path);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    role === p.role
                      ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{p.label}</span>
                    <span className={`text-[10px] ${role === p.role ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      {p.email}
                    </span>
                  </div>
                  {role === p.role && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
              <div className="mt-1 pt-1 border-t border-outline-variant/30">
                <button
                  onClick={() => {
                    setPersonaOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
