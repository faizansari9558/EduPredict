import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchStudentOverview,
  fetchStudentAssessmentTrends,
  fetchStudentSkills,
  fetchStudentWeaknesses,
  fetchStudentPrediction
} from '../services/api';
import './StudentAnalytics.css';

export default function StudentAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState({ assessments: [], performance_by_category: {}, trend: 'stable' });
  const [skills, setSkills] = useState([]);
  const [weaknesses, setWeaknesses] = useState({ strengths: [], weaknesses: [], recommended_focus_areas: [] });
  const [mlPrediction, setMlPrediction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  const studentId = user?.id;

  const loadAnalytics = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('edupredict-token');

      const [overviewRes, trendsRes, skillsRes, weaknessesRes, predictionRes] = await Promise.allSettled([
        fetchStudentOverview(studentId, token),
        fetchStudentAssessmentTrends(studentId, token),
        fetchStudentSkills(studentId, token),
        fetchStudentWeaknesses(studentId, token),
        fetchStudentPrediction(studentId, token)
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
        setOverview(overviewRes.value.data);
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value?.success) {
        setTrends(trendsRes.value.data);
      }
      if (skillsRes.status === 'fulfilled' && skillsRes.value?.success) {
        setSkills(skillsRes.value.data.skills || []);
      }
      if (weaknessesRes.status === 'fulfilled' && weaknessesRes.value?.success) {
        setWeaknesses(weaknessesRes.value.data);
      }
      if (predictionRes.status === 'fulfilled' && predictionRes.value?.success) {
        setMlPrediction(predictionRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Could not load student analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [studentId]);

  // Skill category filter
  const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];
  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const getSkillTier = (proficiency) => {
    if (proficiency >= 80) return { label: 'Advanced', className: 'advanced' };
    if (proficiency >= 60) return { label: 'Intermediate', className: 'intermediate' };
    return { label: 'Beginner', className: 'beginner' };
  };

  const getPlacementStatus = (score) => {
    if (score >= 80) return { label: 'High Readiness', color: '#16a34a', bg: '#dcfce7' };
    if (score >= 60) return { label: 'Moderate Readiness', color: '#d97706', bg: '#fef3c7' };
    return { label: 'Needs Improvement', color: '#dc2626', bg: '#fee2e2' };
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <div className="spinner" />
          <p>Analyzing student performance metrics...</p>
        </div>
      </div>
    );
  }

  const placementStatus = getPlacementStatus(overview?.placement_ready_score || 0);
  const yourScore = Number(overview?.overall_score || 0);
  const cohortAvg = Number(overview?.comparison_to_cohort?.cohort_average || 0);
  const scoreDiff = (yourScore - cohortAvg).toFixed(1);

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title">
          <h1>Student Analytics & Performance Dashboard</h1>
          <p className="analytics-subtitle">
            Track your assessment trends, skill proficiency, cohort percentile, and placement readiness.
          </p>
        </div>
        <div className="analytics-actions">
          {overview?.batch_name && (
            <span className="batch-badge">Cohort: {overview.batch_name}</span>
          )}
          <button type="button" className="refresh-btn" onClick={loadAnalytics}>
            <span>🔄</span> Refresh Insights
          </button>
        </div>
      </div>

      {error && (
        <div className="empty-state" style={{ background: '#fee2e2', borderRadius: '12px', marginBottom: '20px' }}>
          <p style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Overall Score */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Overall Score</span>
            <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>🎯</div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{overview?.overall_score ?? 0}</span>
            <span className="kpi-unit">/ 100</span>
          </div>
          <div className="kpi-footer">
            <span className={`kpi-badge ${trends.trend}`}>
              {trends.trend === 'improving' && '📈 Improving Trend'}
              {trends.trend === 'declining' && '📉 Declining Trend'}
              {trends.trend === 'stable' && '➔ Stable Performance'}
            </span>
          </div>
        </div>

        {/* Placement Readiness */}
        <div className="kpi-card placement">
          <div className="kpi-header">
            <span className="kpi-title">Placement Readiness</span>
            <div className="kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>🚀</div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{overview?.placement_ready_score ?? 0}</span>
            <span className="kpi-unit">/ 100</span>
          </div>
          <div className="kpi-footer">
            <span
              className="kpi-badge"
              style={{ background: placementStatus.bg, color: placementStatus.color }}
            >
              {placementStatus.label}
            </span>
          </div>
        </div>

        {/* Aptitude & Coding Split */}
        <div className="kpi-card aptitude">
          <div className="kpi-header">
            <span className="kpi-title">Aptitude & Coding</span>
            <div className="kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>⚡</div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{overview?.aptitude_score ?? 0}</span>
            <span className="kpi-unit">Apt / {overview?.coding_score ?? 0} Code</span>
          </div>
          <div className="kpi-footer">
            Profile Completion: <strong>{overview?.profile_completion_pct ?? 0}%</strong>
          </div>
        </div>

        {/* Assessments Track Record */}
        <div className="kpi-card coding">
          <div className="kpi-header">
            <span className="kpi-title">Assessments Passed</span>
            <div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>🏆</div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">
              {overview?.assessment_passed ?? 0}
            </span>
            <span className="kpi-unit">/ {overview?.assessment_attempts ?? 0} attempts</span>
          </div>
          <div className="kpi-footer">
            Avg Assessment Score: <strong>{overview?.assessment_avg_score ?? 0}%</strong>
          </div>
        </div>
      </div>

      {/* ML Placement Forecast Banner */}
      {mlPrediction?.prediction && (
        <div className="dashboard-panel" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          marginBottom: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 700 }}>
                🤖 AI Machine Learning Prediction Engine
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0 0', color: '#ffffff' }}>
                Placement Forecast: <span style={{ color: '#38bdf8' }}>{mlPrediction.prediction.placement_tier}</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Placement Odds</span>
                <strong style={{ fontSize: '1.25rem', color: '#4ade80' }}>
                  {mlPrediction.prediction.placement_probability_pct}%
                </strong>
              </div>
              {mlPrediction.prediction.estimated_package_lpa > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Estimated Package</span>
                  <strong style={{ fontSize: '1.25rem', color: '#fbbf24' }}>
                    {mlPrediction.prediction.estimated_package_lpa} LPA
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Key Drivers & Prescriptive Advice */}
          {mlPrediction.explanation && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase' }}>
                  ✅ Top Positive Placement Drivers
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {mlPrediction.explanation.positive_drivers.map((d, i) => (
                    <li key={i} style={{ fontSize: '0.84rem', color: '#e2e8f0', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                      <strong>{d.feature} ({d.value})</strong>: {d.detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                  ⚠️ Risk Factors & Opportunities
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {mlPrediction.explanation.risk_blockers.length > 0 ? (
                    mlPrediction.explanation.risk_blockers.map((b, i) => (
                      <li key={i} style={{ fontSize: '0.84rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                        <strong>{b.feature} ({b.value})</strong>: {b.detail}
                      </li>
                    ))
                  ) : (
                    <li style={{ fontSize: '0.84rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                      No critical placement risks detected. Keep building practical project experience.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main 2-Column Analytics Grid */}
      <div className="analytics-dashboard-grid">
        {/* Left: Cohort Comparison Widget */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">👥 Cohort Benchmark & Comparison</h2>
          </div>

          <div className="cohort-meter-container">
            <div className="cohort-stat-row primary">
              <span>Your Overall Score</span>
              <span>{yourScore.toFixed(1)}%</span>
            </div>

            <div className="cohort-bar-wrapper">
              <div className="cohort-bar-labels">
                <span>0%</span>
                <span>Batch Avg: {cohortAvg.toFixed(1)}%</span>
                <span>100%</span>
              </div>
              <div className="cohort-progress-track">
                <div
                  className="cohort-progress-fill"
                  style={{ width: `${Math.min(Math.max(yourScore, 0), 100)}%` }}
                />
                <div
                  className="cohort-benchmark-pin"
                  style={{ left: `${Math.min(Math.max(cohortAvg, 0), 100)}%` }}
                >
                  <span className="cohort-pin-label">Batch Avg</span>
                </div>
              </div>
            </div>

            <div className="cohort-stat-row" style={{ marginTop: '14px', color: '#475569' }}>
              <span>Comparison to Cohort Average:</span>
              <strong style={{ color: Number(scoreDiff) >= 0 ? '#16a34a' : '#dc2626' }}>
                {Number(scoreDiff) >= 0 ? `+${scoreDiff}% Above Average` : `${scoreDiff}% Below Average`}
              </strong>
            </div>
          </div>

          <div className="cohort-summary-box">
            <div className="cohort-percentile-badge">
              #{overview?.cohort_percentile ?? 1}
            </div>
            <div>
              <p className="cohort-summary-text">
                You rank <strong>#{overview?.cohort_percentile ?? 1}</strong> in your batch.
                {Number(scoreDiff) >= 0
                  ? ' Excellent work! Maintain your momentum by continuing advanced technical practice.'
                  : ' Focus on the identified weaknesses below to boost your rank and placement readiness.'}
              </p>
            </div>
          </div>

          {/* Category Performance Breakdown */}
          {trends.performance_by_category && Object.keys(trends.performance_by_category).length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Performance by Assessment Category
              </h3>
              <div className="category-bars-grid">
                {Object.entries(trends.performance_by_category).map(([category, avgScore]) => (
                  <div key={category} className="category-bar-card">
                    <div className="category-bar-header">
                      <span>{category}</span>
                      <span>{Number(avgScore).toFixed(1)}%</span>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${Math.min(Math.max(Number(avgScore), 0), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Assessment Progression Timeline */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">📈 Assessment History & Trends</h2>
            <span className={`kpi-badge ${trends.trend}`}>
              {trends.trend.toUpperCase()}
            </span>
          </div>

          {trends.assessments && trends.assessments.length > 0 ? (
            <div className="trends-list">
              {trends.assessments.map((a, idx) => (
                <div key={idx} className="trend-item">
                  <div className="trend-item-info">
                    <span className="trend-item-title">{a.title}</span>
                    <div className="trend-item-meta">
                      <span className="trend-type-tag">{a.category || 'General'}</span>
                      <span>{a.date ? new Date(a.date).toLocaleDateString() : 'Recent'}</span>
                      {a.time_taken && <span>⏱ {a.time_taken} mins</span>}
                    </div>
                  </div>
                  <div className="trend-item-score-wrap">
                    <div className="trend-item-score">{a.score}%</div>
                    <span className={`trend-item-status ${a.score >= 60 ? 'pass' : 'fail'}`}>
                      {a.score >= 60 ? 'PASSED' : 'RETRY NEEDED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>No assessment attempts recorded yet.</p>
              <NavLink to="/student" className="primary-btn" style={{ display: 'inline-block', fontSize: '0.85rem' }}>
                Take Your First Assessment
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses Recommendation Panels */}
      <div className="strengths-weaknesses-grid">
        {/* Strengths */}
        <div className="insight-card strengths">
          <div className="insight-header">
            <span style={{ fontSize: '1.4rem' }}>🌟</span>
            <h3>Key Academic & Skill Strengths</h3>
          </div>
          {weaknesses.strengths && weaknesses.strengths.length > 0 ? (
            <ul className="insight-list">
              {weaknesses.strengths.map((s, idx) => (
                <li key={idx} className="insight-item">
                  <div className="insight-item-top">
                    <span>{s.skill}</span>
                    <span style={{ color: '#16a34a' }}>{s.score}% Mastery</span>
                  </div>
                  <p className="insight-recommendation">
                    Strong proficiency demonstrated. Ready for advanced challenges and mock interview questions.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="insight-recommendation" style={{ padding: '8px 0' }}>
              Complete more assessments and coding problems to highlight your top strengths.
            </p>
          )}
        </div>

        {/* Weaknesses & Actionable Recommendations */}
        <div className="insight-card weaknesses">
          <div className="insight-header">
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <h3>Target Focus Areas & Recommendations</h3>
          </div>
          {weaknesses.weaknesses && weaknesses.weaknesses.length > 0 ? (
            <ul className="insight-list">
              {weaknesses.weaknesses.map((w, idx) => (
                <li key={idx} className="insight-item">
                  <div className="insight-item-top">
                    <span>{w.skill}</span>
                    <span style={{ color: '#d97706' }}>{w.score}% Current</span>
                  </div>
                  <p className="insight-recommendation">{w.recommendation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="insight-recommendation" style={{ padding: '8px 0' }}>
              No critical weaknesses detected. Keep practicing across all topics to maintain consistency!
            </p>
          )}
        </div>
      </div>

      {/* Skill Proficiency Matrix */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">🧠 Skill Proficiency Matrix</h2>
          <div className="skills-filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredSkills.length > 0 ? (
          <div className="skills-grid">
            {filteredSkills.map((skill, idx) => {
              const tier = getSkillTier(Number(skill.proficiency));
              return (
                <div key={idx} className="skill-card">
                  <div className="skill-card-top">
                    <span className="skill-name">{skill.skill}</span>
                    <span className={`skill-level-badge ${tier.className}`}>{tier.label}</span>
                  </div>
                  <div className="skill-progress-bar">
                    <div
                      className={`skill-progress-fill ${tier.className}`}
                      style={{ width: `${Math.min(Math.max(Number(skill.proficiency), 0), 100)}%` }}
                    />
                  </div>
                  <div className="skill-meta">
                    <span>Score: <strong>{Number(skill.proficiency).toFixed(1)}%</strong></span>
                    <span>{skill.passed || 0} passed / {skill.attempts || 0} attempts</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No skills recorded in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
