import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');
  const [emailOrId, setEmailOrId] = useState('student@edupredict.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState('');

  // Check if coming from successful registration
  useEffect(() => {
    if (location.state?.prefillEmail) {
      setEmailOrId(location.state.prefillEmail);
      if (location.state.role) setRole(location.state.role);
      setRegisteredSuccess('Account verified and ready! Please sign in below.');
    }
  }, [location.state]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'student') {
      setEmailOrId('student@edupredict.edu');
      setPassword('password123');
    } else if (newRole === 'teacher') {
      setEmailOrId('faculty@edupredict.edu');
      setPassword('password123');
    } else if (newRole === 'admin') {
      setEmailOrId('admin@edupredict.edu');
      setPassword('password123');
    }
  };

  const signIn = async (email, secret) => {
    setLoading(true); setError('');
    try {
      const res = await authApi.login(email,secret);
      if (!['admin','teacher','student'].includes(res.user?.role)) throw new Error('Invalid account role.');
      navigate(`/${res.user.role}/dashboard`);
    } catch(err) { setError(err.message || 'Unable to sign in.'); }
    finally { setLoading(false); }
  };
  const handleQuickLogin = (targetRole,email,secret) => signIn(email,secret);
  const handleSubmit = e => {e.preventDefault();return signIn(emailOrId,password);};

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center flex flex-col items-center space-y-2">
          <Logo size="lg" linkTo="/" />
          <p className="text-xs text-on-surface-variant font-medium pt-1">
            Smart Student Academic &amp; Placement Prediction System
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              Account Sign In
            </h2>
            <p className="text-xs text-on-surface-variant">
              Single unified login portal for Students, Faculty Mentors, and Administrators
            </p>
          </div>

          {/* Registration Success Banner */}
          {registeredSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{registeredSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Official Email or University ID *
              </label>
              <input
                type="text"
                required
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="e.g. user@university.edu or 21CS042 / EMP-9021"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface text-on-surface"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-secondary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 shadow-md" icon="login" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>

          {/* 1-Click Fast Demo Fill Buttons */}
          <div className="pt-2 border-t border-outline-variant/20 space-y-2">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block text-center">
              ⚡ 1-Click Fast Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student', 'student@edupredict.edu', 'password123')}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-center transition-all cursor-pointer hover:shadow-sm active:scale-95 group"
              >
                <span className="block text-xs font-bold text-primary group-hover:scale-105 transition-transform">🎓 Student</span>
                <span className="block text-[10px] text-on-surface-variant font-medium mt-0.5">Auto-Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher', 'faculty@edupredict.edu', 'password123')}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-center transition-all cursor-pointer hover:shadow-sm active:scale-95 group"
              >
                <span className="block text-xs font-bold text-secondary group-hover:scale-105 transition-transform">👨‍🏫 Faculty</span>
                <span className="block text-[10px] text-on-surface-variant font-medium mt-0.5">Auto-Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin@edupredict.edu', 'password123')}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-center transition-all cursor-pointer hover:shadow-sm active:scale-95 group"
              >
                <span className="block text-xs font-bold text-purple-700 dark:text-purple-400 group-hover:scale-105 transition-transform">🛡️ Admin</span>
                <span className="block text-[10px] text-on-surface-variant font-medium mt-0.5">Auto-Login</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
