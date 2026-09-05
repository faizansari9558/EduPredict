import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentAnalytics from './StudentAnalytics';
import ResumeAnalyzer from './ResumeAnalyzer';
import CareerAssistant from './CareerAssistant';
import { fetchStudentScorecard } from '../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [codingChallenges, setCodingChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const handleDownloadScorecard = async () => {
    if (!user?.id) return;
    setScorecardLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchStudentScorecard(user.id, token);
      if (res.success && res.data) {
        const sc = res.data;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>EduPredict Placement Scorecard - ${sc.student_profile.name}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 24px; font-weight: 800; color: #0f172a; }
                .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; }
                .kpi-num { font-size: 28px; font-weight: 800; color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 14px; }
                th { background: #f1f5f9; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px;">
                <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Scorecard</button>
              </div>
              <div class="header">
                <div>
                  <div class="title">🎓 EduPredict Placement Readiness Scorecard</div>
                  <div style="font-size: 13px; color: #64748b;">${sc.institution} • Generated on ${new Date(sc.generated_at).toLocaleDateString()}</div>
                </div>
                <div class="badge">${sc.placement_forecast.predicted_tier} Tier</div>
              </div>

              <div class="grid">
                <div class="card">
                  <h3 style="margin: 0 0 10px; font-size: 16px;">Student Information</h3>
                  <div><strong>Name:</strong> ${sc.student_profile.name}</div>
                  <div><strong>Roll / Enrollment:</strong> ${sc.student_profile.enrollment_number}</div>
                  <div><strong>Department:</strong> ${sc.student_profile.department} (${sc.student_profile.batch})</div>
                  <div><strong>CGPA:</strong> ${sc.student_profile.cgpa} / 10.0</div>
                </div>

                <div class="card">
                  <h3 style="margin: 0 0 10px; font-size: 16px;">ML Placement Prediction</h3>
                  <div class="kpi-num">${sc.placement_forecast.placement_probability_pct}%</div>
                  <div><strong>Status:</strong> ${sc.placement_forecast.readiness_status}</div>
                  <div><strong>Expected Package:</strong> ${sc.placement_forecast.expected_package_range}</div>
                </div>
              </div>

              <div class="card" style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; font-size: 16px;">Assessment & Technical Mastery</h3>
                <div style="display: flex; gap: 30px;">
                  <div>Overall Score: <strong>${sc.academic_and_assessment_metrics.overall_score}%</strong></div>
                  <div>Aptitude: <strong>${sc.academic_and_assessment_metrics.aptitude_score}%</strong></div>
                  <div>Coding Mastery: <strong>${sc.academic_and_assessment_metrics.coding_score}%</strong></div>
                  <div>Passed: <strong>${sc.academic_and_assessment_metrics.assessment_passed} / ${sc.academic_and_assessment_metrics.assessment_attempts}</strong></div>
                </div>
              </div>

              <h3 style="font-size: 16px;">Verified Skill Proficiencies</h3>
              <table>
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Category</th>
                    <th>Average Score</th>
                    <th>Assessment Record</th>
                  </tr>
                </thead>
                <tbody>
                  ${sc.skills_mastery.map(sk => `
                    <tr>
                      <td><strong>${sk.skill_name}</strong></td>
                      <td>${sk.skill_category || 'General'}</td>
                      <td>${sk.avg_score}%</td>
                      <td>${sk.passed_count || 0} passed / ${sk.attempts || 0} attempts</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      console.error('Failed to generate scorecard:', err);
    } finally {
      setScorecardLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchStudentDocuments();
    } else if (activeTab === 'assessments') {
      fetchAssessmentList();
    } else if (activeTab === 'coding') {
      fetchCodingChallenges();
    }
  }, [activeTab]);

  const fetchStudentDashboard = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDashboard(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchStudentDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/student/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDocuments(data.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/student/assessments', {
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

  const fetchCodingChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/coding/challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setCodingChallenges(data.data);
    } catch (error) {
      console.error('Failed to fetch coding challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (assessmentId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/student/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/assessment/${assessmentId}/take/${data.data.attempt_id}`);
      } else {
        alert('Failed to start assessment: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to start assessment:', error);
      alert('Error starting assessment');
    }
  };

  if (!dashboard) {
    return <section className="student-dashboard"><p>Loading...</p></section>;
  }

  const stats = [
    { label: 'Current CGPA', value: dashboard.summary.cgpa, tone: 'blue' },
    { label: 'Profile Completion', value: `${dashboard.summary.profileCompletion}%`, tone: 'green' },
    { label: 'Verified Docs', value: `${dashboard.summary.verifiedDocs}/7`, tone: 'purple' },
    { label: 'Next Assessment', value: dashboard.summary.nextAssessment, tone: 'amber' }
  ];

  return (
    <section className="student-dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">Student Portal</span>
          <h1>Welcome back, {dashboard.student.full_name}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            {dashboard.student.batch} • {dashboard.student.department}
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
          📊 Analytics & Insights
        </button>
        <button
          className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          📄 Resume AI
        </button>
        <button
          className={`tab-btn ${activeTab === 'career' ? 'active' : ''}`}
          onClick={() => setActiveTab('career')}
        >
          🤖 AI Career Copilot
        </button>
        <button
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
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
          Coding Challenges ({codingChallenges.length || '•'})
        </button>
      </div>

      {activeTab === 'analytics' && <StudentAnalytics />}
      {activeTab === 'resume' && <ResumeAnalyzer />}
      {activeTab === 'career' && <CareerAssistant />}

      {activeTab === 'overview' && (
        <div className="panel-grid">
          <div className="info-panel">
            <h2>Upcoming Tasks</h2>
            <ul>
              {dashboard.upcoming.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-panel">
            <h2>Quick Actions</h2>
            <div className="action-stack">
              <button type="button" onClick={() => setActiveTab('analytics')}>📊 View Performance Analytics</button>
              <button type="button" onClick={() => setActiveTab('resume')}>📄 Scan Resume with ATS AI</button>
              <button type="button" onClick={() => setActiveTab('career')}>🤖 Ask AI Career Copilot</button>
              <button type="button" onClick={handleDownloadScorecard} disabled={scorecardLoading} style={{ background: '#0f172a', color: '#38bdf8' }}>
                {scorecardLoading ? '⏳ Generating...' : '🎓 Download Placement Scorecard'}
              </button>
              <button type="button" onClick={() => setActiveTab('coding')}>Launch Coding Arena</button>
              <button type="button" onClick={() => setActiveTab('assessments')}>Take Aptitude Test</button>
              <button type="button" onClick={() => setActiveTab('documents')}>Upload Documents</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="data-panel">
          <h2>Documents</h2>
          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td>{d.document_type}</td>
                    <td>{d.file_name}</td>
                    <td><span className={`badge ${d.verification_status}`}>{d.verification_status}</span></td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No documents uploaded yet.</p>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="data-panel">
          <h2>Available Aptitude Assessments</h2>
          {loading ? (
            <p>Loading assessments...</p>
          ) : assessments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.assessment_type}</td>
                    <td>{a.description?.substring(0, 50) || '—'}</td>
                    <td>
                      <button 
                        onClick={() => handleStartAssessment(a.id)}
                        style={{ fontSize: '0.85rem', padding: '6px 14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Start Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No aptitude assessments available yet.</p>
          )}
        </div>
      )}

      {activeTab === 'coding' && (
        <div className="data-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Coding Challenges & Assessments</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Multi-language Sandbox (JS, Python, C++, Java)</span>
          </div>

          {loading ? (
            <p>Loading coding challenges...</p>
          ) : codingChallenges.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challenge Title</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Best Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {codingChallenges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                        {c.description?.substring(0, 60)}...
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${c.difficulty_level === 'easy' ? 'verified' : (c.difficulty_level === 'hard' ? 'rejected' : 'pending')}`}>
                        {c.difficulty_level}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.solve_status === 'solved' ? 'verified' : (c.solve_status === 'attempted' ? 'pending' : '')}`}>
                        {c.solve_status}
                      </span>
                    </td>
                    <td>{c.best_score !== null ? `${c.best_score}%` : '—'}</td>
                    <td>
                      <NavLink
                        to={`/coding/${c.id}`}
                        style={{
                          fontSize: '0.85rem',
                          padding: '6px 14px',
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          color: 'white',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}
                      >
                        {c.solve_status === 'solved' ? 'Review Code' : 'Code in Arena'}
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No coding challenges published yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
