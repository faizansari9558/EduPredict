import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNo: '',
    department: 'Computer Science & Engineering',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center flex flex-col items-center space-y-2">
          <Logo variant="light" size="lg" />
          <p className="text-xs text-on-surface-variant font-medium pt-2">
            Smart Student Academic & Placement Prediction System
          </p>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              Create New Account
            </h2>
            <p className="text-xs text-on-surface-variant">
              Join EduPredict to unlock AI-powered academic and placement forecasting
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'student'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              I am a Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'teacher'
                  ? 'bg-surface text-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              I am a Faculty Mentor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Faizan Ansari"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {role === 'student' ? 'Roll / Reg No *' : 'Employee ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder={role === 'student' ? '21CS042' : 'EMP-9021'}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Academic Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-surface"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" icon="person_add">
              Complete Registration
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-on-surface-variant">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In here
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
