import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchTeacherClassSummary,
  fetchTeacherAtRiskStudents,
  fetchTeacherAssessmentAnalytics
} from '../services/api';
import './TeacherAnalytics.css';

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [atRiskList, setAtRiskList] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [assessmentAnalytics, setAssessmentAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const teacherId = user?.id;

  const loadTeacherAnalytics = async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('edupredict-token');

      const [summaryRes, atRiskRes, assessListRes] = await Promise.allSettled([
        fetchTeacherClassSummary(teacherId, token),
        fetchTeacherAtRiskStudents(teacherId, token),
        fetch('http://localhost:5000/api/teacher/assessments', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
      if (atRiskRes.status === 'fulfilled' && atRiskRes.value?.success) {
        setAtRiskList(atRiskRes.value.data.at_risk_students || []);
      }
      if (assessListRes.status === 'fulfilled' && assessListRes.value?.success) {
        const list = assessListRes.value.data || [];
        setAssessments(list);
        if (list.length > 0) {
          setSelectedAssessmentId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load teacher analytics:', err);
      setError('Could not load teacher analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherAnalytics();
  }, [teacherId]);

  useEffect(() => {
    if (!selectedAssessmentId || !teacherId) return;
    const fetchSpecificAssessment = async () => {
      try {
        const token = localStorage.getItem('edupredict-token');
        const res = await fetchTeacherAssessmentAnalytics(teacherId, selectedAssessmentId, token);
        if (res.success) {
          setAssessmentAnalytics(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch assessment analytics:', err);
      }
    };
    fetchSpecificAssessment();
  }, [selectedAssessmentId, teacherId]);

  if (loading) {
    return (
      <div className="teacher-analytics-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>Analyzing cohort & class metrics...</p>
        </div>
      </div>
    );
  }

  const totalAssigned = summary?.assigned_students || 0;
  const dist = summary?.score_distribution || {};
  const totalInDist = (dist['80-100'] || 0) + (dist['60-80'] || 0) + (dist['40-60'] || 0) + (dist['0-40'] || 0) || 1;

  return (
    <div className="teacher-analytics-container">
      {/* Header */}
      <div className="teacher-analytics-header">
        <div className="teacher-analytics-title">
          <h1>Class Performance & At-Risk Analytics</h1>
          <p className="teacher-analytics-subtitle">
            Comprehensive overview of student cohorts, score distributions, and early warning flags.
          </p>
        </div>
        <button type="button" className="refresh-btn" onClick={loadTeacherAnalytics}>
          <span>🔄</span> Refresh Analytics
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Top KPIs */}
      <div className="teacher-kpi-grid">
        <div className="teacher-kpi-card">
          <div className="teacher-kpi-header">
            <span className="teacher-kpi-title">Assigned Students</span>
            <span style={{ fontSize: '1.2rem' }}>👥</span>
          </div>
          <div className="teacher-kpi-value-wrap">
            <span className="teacher-kpi-value">{totalAssigned}</span>
            <span className="teacher-kpi-unit">students</span>
          </div>
          <div className="teacher-kpi-sub">Across all batches</div>
        </div>

        <div className="teacher-kpi-card average">
          <div className="teacher-kpi-header">
            <span className="teacher-kpi-title">Class Average Score</span>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
          </div>
          <div className="teacher-kpi-value-wrap">
            <span className="teacher-kpi-value">{summary?.class_average ?? 0}</span>
            <span className="teacher-kpi-unit">%</span>
          </div>
          <div className="teacher-kpi-sub">Class Median: <strong>{summary?.class_median ?? 0}%</strong></div>
        </div>

        <div className="teacher-kpi-card high">
          <div className="teacher-kpi-header">
            <span className="teacher-kpi-title">Top Performers</span>
            <span style={{ fontSize: '1.2rem' }}>🌟</span>
          </div>
          <div className="teacher-kpi-value-wrap">
            <span className="teacher-kpi-value">{summary?.high_performers ?? 0}</span>
            <span className="teacher-kpi-unit">students (≥80%)</span>
          </div>
          <div className="teacher-kpi-sub">Ready for advanced placement</div>
        </div>

        <div className="teacher-kpi-card risk">
          <div className="teacher-kpi-header">
            <span className="teacher-kpi-title">At-Risk Students</span>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          </div>
          <div className="teacher-kpi-value-wrap">
            <span className="teacher-kpi-value" style={{ color: '#dc2626' }}>
              {summary?.at_risk_students ?? atRiskList.length}
            </span>
            <span className="teacher-kpi-unit">flagged</span>
          </div>
          <div className="teacher-kpi-sub" style={{ color: '#b91c1c', fontWeight: 600 }}>
            Intervention recommended
          </div>
        </div>
      </div>

      {/* 2-Column: Score Distribution & At-Risk Summary */}
      <div className="teacher-grid-2col">
        {/* Score Distribution */}
        <div className="teacher-panel">
          <div className="teacher-panel-header">
            <h2 className="teacher-panel-title">📊 Score Distribution</h2>
          </div>

          <div className="distribution-bars">
            <div className="dist-bar-item">
              <div className="dist-bar-info">
                <span>🌟 High Performers (80 - 100%)</span>
                <span>{dist['80-100'] || 0} students ({Math.round(((dist['80-100'] || 0) / totalInDist) * 100)}%)</span>
              </div>
              <div className="dist-track">
                <div
                  className="dist-fill high"
                  style={{ width: `${((dist['80-100'] || 0) / totalInDist) * 100}%` }}
                />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-bar-info">
                <span>📘 Good Performers (60 - 80%)</span>
                <span>{dist['60-80'] || 0} students ({Math.round(((dist['60-80'] || 0) / totalInDist) * 100)}%)</span>
              </div>
              <div className="dist-track">
                <div
                  className="dist-fill good"
                  style={{ width: `${((dist['60-80'] || 0) / totalInDist) * 100}%` }}
                />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-bar-info">
                <span>📙 Average Performers (40 - 60%)</span>
                <span>{dist['40-60'] || 0} students ({Math.round(((dist['40-60'] || 0) / totalInDist) * 100)}%)</span>
              </div>
              <div className="dist-track">
                <div
                  className="dist-fill average"
                  style={{ width: `${((dist['40-60'] || 0) / totalInDist) * 100}%` }}
                />
              </div>
            </div>

            <div className="dist-bar-item">
              <div className="dist-bar-info">
                <span>⚠️ Low Performers (Below 40%)</span>
                <span>{dist['0-40'] || 0} students ({Math.round(((dist['0-40'] || 0) / totalInDist) * 100)}%)</span>
              </div>
              <div className="dist-track">
                <div
                  className="dist-fill low"
                  style={{ width: `${((dist['0-40'] || 0) / totalInDist) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Analytics Deep Dive */}
        <div className="teacher-panel">
          <div className="teacher-panel-header">
            <h2 className="teacher-panel-title">📝 Assessment Deep Dive</h2>
          </div>

          <div className="assessment-select-row">
            <select
              className="assessment-select"
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.assessment_type || 'Aptitude'})
                </option>
              ))}
            </select>
          </div>

          {assessmentAnalytics ? (
            <div>
              <div className="assessment-kpi-summary">
                <div className="assessment-sub-kpi">
                  <span>Total Attempts</span>
                  <strong>{assessmentAnalytics.total_attempts || 0}</strong>
                </div>
                <div className="assessment-sub-kpi">
                  <span>Average Score</span>
                  <strong>{assessmentAnalytics.avg_score || 0}%</strong>
                </div>
                <div className="assessment-sub-kpi">
                  <span>Pass Rate</span>
                  <strong style={{ color: '#16a34a' }}>{assessmentAnalytics.pass_rate || 0}%</strong>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '12px' }}>
              Select an assessment above to inspect question breakdown and response rates.
            </p>
          )}
        </div>
      </div>

      {/* At-Risk Students Table */}
      <div className="teacher-panel">
        <div className="teacher-panel-header">
          <h2 className="teacher-panel-title">🚨 Flagged At-Risk Students & Interventions</h2>
          <span className="risk-badge critical">{atRiskList.length} Students Flagged</span>
        </div>

        {atRiskList.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Batch</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Intervention Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskList.map((stu) => (
                  <tr key={stu.id}>
                    <td>
                      <strong>{stu.student_name || `Student #${stu.student_id}`}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{stu.email}</div>
                    </td>
                    <td>{stu.batch_name || 'CSE Batch'}</td>
                    <td>
                      <strong>{stu.risk_score}</strong> / 100
                    </td>
                    <td>
                      <span className={`risk-badge ${stu.risk_level}`}>
                        {stu.risk_level}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${stu.intervention_status}`}>
                        {stu.intervention_status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: '#64748b' }}>
                      {stu.intervention_notes || 'Pending initial review'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="action-sm-btn"
                        onClick={() => alert(`Intervention logging modal for ${stu.student_name || 'student'}`)}
                      >
                        Log Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            <p>No at-risk students flagged for your assigned cohorts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
