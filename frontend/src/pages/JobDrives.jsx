import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchJobDrives,
  applyJobDrive,
  createJobDrive,
  fetchDriveCandidates,
  updateCandidateStatus
} from '../services/api';
import './JobDrives.css';

export default function JobDrives() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEligible, setFilterEligible] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingDrive, setSubmittingDrive] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // New Drive Form State
  const [newDrive, setNewDrive] = useState({
    company_name: '',
    job_title: '',
    job_role: 'Full-Stack / Software Engineering',
    package_lpa: 10.0,
    min_cgpa: 7.0,
    min_aptitude_score: 65.0,
    min_coding_score: 65.0,
    required_skills: 'React, Node.js, Python, SQL',
    job_description: ''
  });

  const loadDrives = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchJobDrives(token);
      if (res.success) {
        setDrives(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await applyJobDrive(driveId, token);
      if (res.success) {
        setActionMessage(res.message);
        setTimeout(() => setActionMessage(null), 4000);
        loadDrives();
      }
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  const handleViewCandidates = async (drive) => {
    setSelectedDrive(drive);
    setCandidatesLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchDriveCandidates(drive.id, token);
      if (res.success) {
        setCandidates(res.data || []);
      }
    } catch (err) {
      console.error('Candidates fetch error:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      await updateCandidateStatus(applicationId, newStatus, token);
      setCandidates(prev => prev.map(c => c.application_id === applicationId ? { ...c, application_status: newStatus } : c));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setSubmittingDrive(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const payload = {
        ...newDrive,
        required_skills: newDrive.required_skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await createJobDrive(payload, token);
      if (res.success) {
        setShowCreateModal(false);
        setNewDrive({
          company_name: '',
          job_title: '',
          job_role: 'Full-Stack / Software Engineering',
          package_lpa: 10.0,
          min_cgpa: 7.0,
          min_aptitude_score: 65.0,
          min_coding_score: 65.0,
          required_skills: 'React, Node.js, Python, SQL',
          job_description: ''
        });
        loadDrives();
      }
    } catch (err) {
      console.error('Create drive error:', err);
    } finally {
      setSubmittingDrive(false);
    }
  };

  const filteredDrives = filterEligible
    ? drives.filter(d => d.is_eligible)
    : drives;

  return (
    <div className="job-drives-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="page-subtitle">Campus Recruitment & Placement Cell</span>
          <h1 className="page-title">💼 Placement Drives & Opportunities</h1>
          <p className="page-description">
            Explore verified corporate job drives, verify eligibility against your academic & coding records, and apply with automatic ML candidate matching.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            type="button"
            className="create-drive-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Post New Placement Drive
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="action-alert success">
          ✅ {actionMessage}
        </div>
      )}

      {/* Filter Tabs */}
      {user?.role === 'student' && (
        <div className="drives-filter-bar">
          <button
            type="button"
            className={`filter-btn ${!filterEligible ? 'active' : ''}`}
            onClick={() => setFilterEligible(false)}
          >
            All Active Drives ({drives.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterEligible ? 'active' : ''}`}
            onClick={() => setFilterEligible(true)}
          >
            🎯 Eligible for Me ({drives.filter(d => d.is_eligible).length})
          </button>
        </div>
      )}

      {/* Drives Grid */}
      {loading ? (
        <p>Loading placement drives...</p>
      ) : filteredDrives.length === 0 ? (
        <div className="empty-drives">
          <span>💼</span>
          <h3>No Placement Drives Found</h3>
          <p>No job drives match your current filter criteria.</p>
        </div>
      ) : (
        <div className="drives-grid">
          {filteredDrives.map((d) => (
            <div key={d.id} className="drive-card">
              <div className="drive-card-header">
                <div className="company-badge">
                  <div className="company-logo">{d.company_name.charAt(0)}</div>
                  <div>
                    <h3 className="company-name">{d.company_name}</h3>
                    <span className="job-title">{d.job_title}</span>
                  </div>
                </div>
                <div className="package-tag">
                  💰 {d.package_lpa} LPA
                </div>
              </div>

              <p className="drive-desc">{d.job_description || 'Campus recruitment drive for graduating batch.'}</p>

              {/* Eligibility Matrix */}
              <div className="eligibility-checklist">
                <span className="section-label">Eligibility Criteria</span>
                <div className="criteria-row">
                  <span className={`criteria-chip ${d.eligibility_details?.cgpa_eligible ? 'pass' : 'fail'}`}>
                    {d.eligibility_details?.cgpa_eligible ? '✓' : '✗'} Min CGPA: {d.min_cgpa}
                  </span>
                  <span className={`criteria-chip ${d.eligibility_details?.aptitude_eligible ? 'pass' : 'fail'}`}>
                    {d.eligibility_details?.aptitude_eligible ? '✓' : '✗'} Aptitude: {d.min_aptitude_score}%
                  </span>
                  <span className={`criteria-chip ${d.eligibility_details?.coding_eligible ? 'pass' : 'fail'}`}>
                    {d.eligibility_details?.coding_eligible ? '✓' : '✗'} Coding: {d.min_coding_score}%
                  </span>
                </div>
              </div>

              {/* Required Skills */}
              {d.required_skills?.length > 0 && (
                <div className="skills-wrap">
                  {d.required_skills.map((sk, si) => (
                    <span key={si} className="skill-chip">{sk}</span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="drive-card-footer">
                <span className="applicant-count">👥 {d.total_applicants || 0} applicants</span>

                {user?.role === 'student' ? (
                  d.application_status ? (
                    <span className={`app-status-badge ${d.application_status}`}>
                      ✓ {d.application_status.toUpperCase()}
                      {d.my_match_score && ` (${d.my_match_score}% Match)`}
                    </span>
                  ) : d.is_eligible ? (
                    <button
                      type="button"
                      className="apply-btn"
                      onClick={() => handleApply(d.id)}
                    >
                      Apply Now 🚀
                    </button>
                  ) : (
                    <span className="ineligible-tag">Criteria Not Met</span>
                  )
                ) : (
                  <button
                    type="button"
                    className="view-candidates-btn"
                    onClick={() => handleViewCandidates(d)}
                  >
                    View Applicants ({d.total_applicants || 0}) 🔍
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Pool Drawer / Modal for Faculty / Admin */}
      {selectedDrive && (
        <div className="modal-backdrop" onClick={() => setSelectedDrive(null)}>
          <div className="modal-card candidates-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedDrive.company_name} — Candidate Applications</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedDrive.job_title} • {selectedDrive.package_lpa} LPA
                </p>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setSelectedDrive(null)}>✕</button>
            </div>

            <div className="modal-body">
              {candidatesLoading ? (
                <p>Loading candidate applications...</p>
              ) : candidates.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No students have applied to this drive yet.</p>
              ) : (
                <table className="candidates-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Dept & CGPA</th>
                      <th>ML Match Score</th>
                      <th>Assessments</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.application_id}>
                        <td>
                          <strong>{c.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                        </td>
                        <td>
                          {c.department_name || 'CSE'} • <strong>{c.cgpa || 7.5} CGPA</strong>
                        </td>
                        <td>
                          <span className="match-badge" style={{ background: c.ml_match_score >= 80 ? '#dcfce7' : '#fef3c7', color: c.ml_match_score >= 80 ? '#166534' : '#92400e' }}>
                            {c.ml_match_score}% Match
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem' }}>Apt: {c.aptitude_score || 0}%</div>
                          <div style={{ fontSize: '0.78rem' }}>Code: {c.coding_score || 0}%</div>
                        </td>
                        <td>
                          <span className={`status-pill ${c.application_status}`}>
                            {c.application_status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="action-small shortlist"
                              onClick={() => handleUpdateStatus(c.application_id, 'shortlisted')}
                              title="Shortlist Candidate"
                            >
                              ✓ Shortlist
                            </button>
                            <button
                              type="button"
                              className="action-small select"
                              onClick={() => handleUpdateStatus(c.application_id, 'selected')}
                              title="Mark Selected"
                            >
                              🏆 Select
                            </button>
                            <button
                              type="button"
                              className="action-small reject"
                              onClick={() => handleUpdateStatus(c.application_id, 'rejected')}
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Campus Placement Drive</h2>
              <button type="button" className="close-modal-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateDrive} className="drive-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, TCS"
                    value={newDrive.company_name}
                    onChange={e => setNewDrive({ ...newDrive, company_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer (SDE-1)"
                    value={newDrive.job_title}
                    onChange={e => setNewDrive({ ...newDrive, job_title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newDrive.package_lpa}
                    onChange={e => setNewDrive({ ...newDrive, package_lpa: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newDrive.min_cgpa}
                    onChange={e => setNewDrive({ ...newDrive, min_cgpa: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Aptitude Score (%)</label>
                  <input
                    type="number"
                    value={newDrive.min_aptitude_score}
                    onChange={e => setNewDrive({ ...newDrive, min_aptitude_score: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Min Coding Score (%)</label>
                  <input
                    type="number"
                    value={newDrive.min_coding_score}
                    onChange={e => setNewDrive({ ...newDrive, min_coding_score: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, Data Structures, SQL"
                  value={newDrive.required_skills}
                  onChange={e => setNewDrive({ ...newDrive, required_skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  rows="3"
                  placeholder="Role responsibilities, department requirements, interview process..."
                  value={newDrive.job_description}
                  onChange={e => setNewDrive({ ...newDrive, job_description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submittingDrive}>
                  {submittingDrive ? 'Publishing...' : '🚀 Publish Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
