import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminSystemOverview,
  fetchAdminDepartments,
  fetchAdminPlacementReadiness,
  fetchDepartmentBatches,
  fetchDepartmentSkills
} from '../services/api';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemOverview, setSystemOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [placementStats, setPlacementStats] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('1');
  const [batches, setBatches] = useState([]);
  const [deptSkills, setDeptSkills] = useState([]);
  const [error, setError] = useState(null);

  const loadAdminAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('edupredict-token');

      const [systemRes, deptRes, placementRes] = await Promise.allSettled([
        fetchAdminSystemOverview(token),
        fetchAdminDepartments(token),
        fetchAdminPlacementReadiness(token)
      ]);

      if (systemRes.status === 'fulfilled' && systemRes.value?.success) {
        setSystemOverview(systemRes.value.data);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.success) {
        const list = deptRes.value.data.departments || [];
        setDepartments(list);
        if (list.length > 0 && !selectedDeptId) {
          setSelectedDeptId(String(list[0].id));
        }
      }
      if (placementRes.status === 'fulfilled' && placementRes.value?.success) {
        setPlacementStats(placementRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Could not load institution analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminAnalytics();
  }, []);

  useEffect(() => {
    if (!selectedDeptId) return;
    const loadDeptDetails = async () => {
      try {
        const token = localStorage.getItem('edupredict-token');
        const [batchRes, skillRes] = await Promise.allSettled([
          fetchDepartmentBatches(selectedDeptId, token),
          fetchDepartmentSkills(selectedDeptId, token)
        ]);

        if (batchRes.status === 'fulfilled' && batchRes.value?.success) {
          setBatches(batchRes.value.data.batches || []);
        }
        if (skillRes.status === 'fulfilled' && skillRes.value?.success) {
          setDeptSkills(skillRes.value.data.skills || []);
        }
      } catch (err) {
        console.warn('Could not load department batches:', err);
      }
    };
    loadDeptDetails();
  }, [selectedDeptId]);

  if (loading) {
    return (
      <div className="admin-analytics-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>Aggregating institutional performance data...</p>
        </div>
      </div>
    );
  }

  const sys = systemOverview || {};

  return (
    <div className="admin-analytics-container">
      {/* Header */}
      <div className="admin-analytics-header">
        <div className="admin-analytics-title">
          <h1>Institutional Analytics & Department Benchmarks</h1>
          <p className="admin-analytics-subtitle">
            System-wide performance, department rankings, placement readiness statistics, and batch metrics.
          </p>
        </div>
        <button type="button" className="refresh-btn" onClick={loadAdminAnalytics}>
          <span>🔄</span> Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Enrolled</span>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
          </div>
          <div className="admin-kpi-value-wrap">
            <span className="admin-kpi-value">{sys.total_students || 0}</span>
            <span className="admin-kpi-unit">students</span>
          </div>
          <div className="admin-kpi-sub">Across all campus departments</div>
        </div>

        <div className="admin-kpi-card depts">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Avg Academic Score</span>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
          </div>
          <div className="admin-kpi-value-wrap">
            <span className="admin-kpi-value">{sys.system_avg_score || 0}</span>
            <span className="admin-kpi-unit">%</span>
          </div>
          <div className="admin-kpi-sub">Institutional assessment benchmark</div>
        </div>

        <div className="admin-kpi-card placement">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Placement Readiness</span>
            <span style={{ fontSize: '1.2rem' }}>💼</span>
          </div>
          <div className="admin-kpi-value-wrap">
            <span className="admin-kpi-value">{sys.system_placement_ready_pct || 0}</span>
            <span className="admin-kpi-unit">%</span>
          </div>
          <div className="admin-kpi-sub">
            <strong>{sys.total_placement_ready || 0}</strong> students placement-ready
          </div>
        </div>

        <div className="admin-kpi-card passrate">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Assessment Pass Rate</span>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
          </div>
          <div className="admin-kpi-value-wrap">
            <span className="admin-kpi-value">{sys.system_pass_rate || 0}</span>
            <span className="admin-kpi-unit">%</span>
          </div>
          <div className="admin-kpi-sub">Institutional pass rate</div>
        </div>
      </div>

      {/* Department Rankings Table */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">🏛️ Department Performance & Placement Rankings</h2>
        </div>

        {departments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="dept-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Avg Score</th>
                  <th>Placement Ready</th>
                  <th>Pass Rate</th>
                  <th>At-Risk</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, idx) => (
                  <tr key={d.id || idx}>
                    <td>
                      <span className={`rank-badge rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <strong>{d.name || d.department_name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Code: {d.code || 'ENG'}</div>
                    </td>
                    <td>{d.total_students || d.student_count || 0}</td>
                    <td>
                      <div className="dept-progress-wrap">
                        <div className="dept-progress-track">
                          <div
                            className="dept-progress-fill"
                            style={{ width: `${Math.min(Math.max(Number(d.avg_score || 0), 0), 100)}%` }}
                          />
                        </div>
                        <strong>{Number(d.avg_score || 0).toFixed(1)}%</strong>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#16a34a' }}>
                        {Number(d.placement_ready_pct || d.placement_rate_pct || 0).toFixed(1)}%
                      </strong>
                    </td>
                    <td>{Number(d.pass_rate || 0).toFixed(1)}%</td>
                    <td>
                      <span style={{ color: Number(d.at_risk_count) > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                        {d.at_risk_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>No department statistics available.</p>
        )}
      </div>

      {/* Department Cohort & Batch Deep Dive */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">👥 Department Cohorts & Batches</h2>
          <select
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name || dept.department_name}
              </option>
            ))}
          </select>
        </div>

        {batches.length > 0 ? (
          <div className="batch-cards-grid">
            {batches.map((b) => (
              <div key={b.id || b.batch_id} className="batch-card">
                <div className="batch-card-top">
                  <span className="batch-card-title">{b.batch_name || b.name || `Batch #${b.batch_id}`}</span>
                  <span className="batch-badge">Rank #{b.batch_rank || 1}</span>
                </div>
                <div className="batch-card-metrics">
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Students</span>
                    <div><strong>{b.student_count || b.total_students || 0}</strong></div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Avg Score</span>
                    <div><strong>{Number(b.avg_score || 0).toFixed(1)}%</strong></div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Placement Ready</span>
                    <div style={{ color: '#16a34a' }}><strong>{b.placement_ready_count || 0}</strong></div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>At-Risk</span>
                    <div style={{ color: '#dc2626' }}><strong>{b.at_risk_count || 0}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>No batch metrics found for this department.</p>
        )}
      </div>
    </div>
  );
}
