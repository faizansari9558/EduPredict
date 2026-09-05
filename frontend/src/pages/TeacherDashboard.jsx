import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeacherAnalytics from './TeacherAnalytics';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchTeacherStudents();
    } else if (activeTab === 'assessments') {
      fetchTeacherAssessments();
    } else if (activeTab === 'coding') {
      fetchCodingProblems();
    }
  }, [activeTab]);

  const fetchTeacherDashboard = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/teacher/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDashboard(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const handleExportBatchCSV = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/reports/batch/1/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const fetchTeacherStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/teacher/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherAssessments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/teacher/assessments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssessments(data.data);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingProblems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/coding', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setCodingProblems(data.data);
    } catch (error) {
      console.error('Failed to fetch coding problems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!dashboard) {
    return <section className="teacher-dashboard"><p>Loading...</p></section>;
  }

  const stats = [
    { label: 'Assigned Students', value: dashboard.summary.assignedStudents, tone: 'blue' },
    { label: 'Pending Reviews', value: dashboard.summary.pendingVerifications, tone: 'green' },
    { label: 'Active Assessments', value: dashboard.summary.activeAssessments, tone: 'purple' },
    { label: 'Mentor Slots', value: dashboard.summary.mentorSlots, tone: 'amber' }
  ];

  return (
    <section className="teacher-dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">Teacher Portal</span>
          <h1>Welcome, {dashboard.teacher.full_name}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            {dashboard.teacher.designation} • {dashboard.teacher.department}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((card) => (
          <div className={`stat-card ${card.tone}`} key={card.label}>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics & At-Risk
        </button>
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessments')}
        >
          Aptitude Tests
        </button>
        <button
          className={`tab-btn ${activeTab === 'coding' ? 'active' : ''}`}
          onClick={() => setActiveTab('coding')}
        >
          Coding Challenges ({codingProblems.length || '•'})
        </button>
      </div>

      {activeTab === 'analytics' && <TeacherAnalytics />}

      {activeTab === 'overview' && (
        <div className="panel-grid">
          <div className="info-panel">
            <h2>Priority Tasks</h2>
            <ul>
              {dashboard.alerts.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>

          <div className="info-panel">
            <h2>Quick Actions</h2>
            <div className="action-stack">
              <button type="button" onClick={() => setActiveTab('analytics')}>📊 View Class Analytics & At-Risk</button>
              <button type="button" onClick={handleExportBatchCSV} style={{ background: '#0f172a', color: '#38bdf8' }}>
                📥 Export Cohort Performance CSV
              </button>
              <NavLink to="/teacher/coding" style={{ textDecoration: 'none' }}>
                <button type="button" style={{ width: '100%' }}>Manage Coding Challenges</button>
              </NavLink>
              <NavLink to="/assessments" style={{ textDecoration: 'none' }}>
                <button type="button" style={{ width: '100%' }}>Create Aptitude Test</button>
              </NavLink>
              <button type="button" onClick={() => setActiveTab('students')}>Review Student Verifications</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="data-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Assigned Students</h2>
            <button
              type="button"
              onClick={handleExportBatchCSV}
              style={{ padding: '8px 16px', background: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📥 Export CSV Report
            </button>
          </div>
          {loading ? (
            <p>Loading students...</p>
          ) : students.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Verification</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.enrollment_number}</td>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.department}</td>
                    <td><span className={`badge ${s.verification_status}`}>{s.verification_status}</span></td>
                    <td>{s.cgpa || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students found.</p>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="data-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Aptitude Assessments</h2>
            <NavLink to="/assessments" style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
              + Create Aptitude Test
            </NavLink>
          </div>
          {loading ? (
            <p>Loading assessments...</p>
          ) : assessments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.assessment_type}</td>
                    <td>
                      <span className={`badge ${a.published_at ? 'verified' : 'pending'}`}>
                        {a.published_at ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No assessments found. <NavLink to="/assessments">Create one now</NavLink></p>
          )}
        </div>
      )}

      {activeTab === 'coding' && (
        <div className="data-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Coding Challenges & Assessment Engine</h2>
            <NavLink to="/teacher/coding" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700' }}>
              Open Coding Manager →
            </NavLink>
          </div>
          {loading ? (
            <p>Loading coding challenges...</p>
          ) : codingProblems.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Test Cases</th>
                  <th>Submissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {codingProblems.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td>
                      <span className={`badge ${p.difficulty_level === 'easy' ? 'verified' : (p.difficulty_level === 'hard' ? 'rejected' : 'pending')}`}>
                        {p.difficulty_level}
                      </span>
                    </td>
                    <td>{p.testcase_count || 0} cases</td>
                    <td>{p.submission_count || 0} submissions</td>
                    <td>
                      <span className={`badge ${p.is_published ? 'verified' : 'pending'}`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No coding problems created yet. <NavLink to="/teacher/coding">Create your first challenge</NavLink></p>
          )}
        </div>
      )}
    </section>
  );
}
