import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import HelpPage from './pages/public/HelpPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import AcademicRecords from './pages/student/AcademicRecords';
import StudentSkills from './pages/student/StudentSkills';
import StudentProjects from './pages/student/StudentProjects';
import StudentCertifications from './pages/student/StudentCertifications';
import StudentInternships from './pages/student/StudentInternships';
import StudentResume from './pages/student/StudentResume';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentResults from './pages/student/StudentResults';
import PlacementAnalysis from './pages/student/PlacementAnalysis';
import StudentNotifications from './pages/student/StudentNotifications';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignedStudents from './pages/teacher/AssignedStudents';
import DocumentVerification from './pages/teacher/DocumentVerification';
import TeacherAssessments from './pages/teacher/TeacherAssessments';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherNotifications from './pages/teacher/TeacherNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import InstitutionalAnalytics from './pages/admin/InstitutionalAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing, Info & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Student Portal Routes */}
          <Route path="/student" element={<MainLayout role="student" />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="academic-records" element={<AcademicRecords />} />
            <Route path="skills" element={<StudentSkills />} />
            <Route path="projects" element={<StudentProjects />} />
            <Route path="certifications" element={<StudentCertifications />} />
            <Route path="internships" element={<StudentInternships />} />
            <Route path="resume" element={<StudentResume />} />
            <Route path="assessments" element={<StudentAssessments />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="placement-analysis" element={<PlacementAnalysis />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Teacher Portal Routes */}
          <Route path="/teacher" element={<MainLayout role="teacher" />}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<AssignedStudents />} />
            <Route path="verification" element={<DocumentVerification />} />
            <Route path="assessments" element={<TeacherAssessments />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="notifications" element={<TeacherNotifications />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<MainLayout role="admin" />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="analytics" element={<InstitutionalAnalytics />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* Catch-all 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
