import { Routes, Route, NavLink } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AssessmentBuilder from './pages/AssessmentBuilder';
import AssessmentTaker from './pages/AssessmentTaker';
import CodingArena from './pages/CodingArena';
import CodingManager from './pages/CodingManager';
import StudentAnalytics from './pages/StudentAnalytics';
import TeacherAnalytics from './pages/TeacherAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CareerAssistant from './pages/CareerAssistant';
import JobDrives from './pages/JobDrives';
import NotificationBell from './components/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';
import Logo from './components/Logo';
import { useAuth } from './context/AuthContext';
import { loginUser } from './services/api';

function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <Logo size="md" theme="dark" linkTo="/" />
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          {!user && <NavLink to="/login">Login</NavLink>}
          {!user && <NavLink to="/register">Register</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/analytics">Analytics</NavLink>}
          {user?.role === 'teacher' && <NavLink to="/teacher">Teacher</NavLink>}
          {user?.role === 'teacher' && <NavLink to="/teacher/analytics">Analytics</NavLink>}
          {user?.role === 'teacher' && <NavLink to="/teacher/coding">Coding Problems</NavLink>}
          {user?.role === 'student' && <NavLink to="/student">Dashboard</NavLink>}
          {user?.role === 'student' && <NavLink to="/student/analytics">Analytics</NavLink>}
          {user?.role === 'student' && <NavLink to="/student/resume">Resume AI</NavLink>}
          {user?.role === 'student' && <NavLink to="/student/career-assistant">AI Copilot</NavLink>}
          {user && <NavLink to="/job-drives">Placement Drives</NavLink>}
          {user && <NotificationBell />}
          {user && (
            <button type="button" className="logout-btn" onClick={logout}>Logout</button>
          )}
        </nav>
      </header>

      <main className="page-content">{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <Logo size="sm" theme="dark" linkTo="/" />
          <p>© 2026 EduPredict • Smart Student Academic &amp; Placement Prediction System</p>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="hero-logo-banner">
          <Logo size="xl" theme="light" />
        </div>
        <span className="eyebrow">Smart Campus Intelligence</span>
        <h1>Empower students with smarter academic and placement decisions.</h1>
        <p>
          EduPredict helps institutions track academic progress, verify student records,
          deliver assessments, and use data-driven insight for placement readiness.
        </p>

        <div className="cta-row">
          <NavLink className="primary-btn" to="/register">Create Account</NavLink>
          <NavLink className="secondary-btn" to="/login">Login</NavLink>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Student Profile</h3>
            <p>Academic tracking, documents, projects, skills, and placement readiness.</p>
          </div>
          <div className="feature-card">
            <h3>Teacher Review</h3>
            <p>Manage assigned students, verify submissions, and publish assessment results.</p>
          </div>
          <div className="feature-card">
            <h3>Admin Insights</h3>
            <p>Monitor department performance, assessments, and placement analytics.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginPage() {
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return;
    }

    try {
      const response = await loginUser(String(email), String(password));
      const userPayload = {
        id: response.user?.id,
        email: response.user?.email,
        role: response.user?.role,
        name: response.user?.email?.split('@')[0] || 'User'
      };

      localStorage.setItem('edupredict-token', response.token);
      login(userPayload);
    } catch (error) {
      alert(error.message || 'Login failed.');
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-box">
        <div className="auth-logo-header">
          <Logo size="lg" theme="light" linkTo="/" />
        </div>
        <h2>Welcome Back</h2>
        <p>Use your university account to continue.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" placeholder="Enter your email" defaultValue="student@edupredict.edu" />
          </label>

          <label>
            Password
            <input type="password" name="password" placeholder="Enter your password" defaultValue="password123" />
          </label>

          <button type="submit" className="primary-btn full-width">Login</button>
        </form>
      </div>
    </section>
  );
}

function RegisterPage() {
  return (
    <section className="auth-panel">
      <div className="auth-box">
        <div className="auth-logo-header">
          <Logo size="lg" theme="light" linkTo="/" />
        </div>
        <h2>Create Account</h2>
        <p>Complete university verification to activate your EduPredict account.</p>

        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="college email address" />
          </label>

          <label>
            User ID
            <input type="text" placeholder="Authorized university user ID" />
          </label>

          <button type="submit" className="primary-btn full-width">Continue</button>
        </form>
      </div>
    </section>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/department"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/coding"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CodingManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/analytics"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <StudentAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics/student"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <StudentAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/resume"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/career-assistant"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CareerAssistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment/:assessmentId/take/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AssessmentTaker />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coding/:problemId"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <CodingArena />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-drives"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <JobDrives />
            </ProtectedRoute>
          }
        />

        {user && user.role === 'admin' && <Route path="*" element={<AdminDashboard />} />}
        {user && user.role === 'teacher' && <Route path="*" element={<TeacherDashboard />} />}
        {user && user.role === 'student' && <Route path="*" element={<StudentDashboard />} />}
      </Routes>
    </Layout>
  );
}
