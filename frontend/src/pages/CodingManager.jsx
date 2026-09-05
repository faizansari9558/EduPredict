import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CodingManager.css';

export default function CodingManager() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Drawer states
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [modalTab, setModalTab] = useState('general'); // 'general' | 'testcases' | 'templates'

  // Submissions inspector modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [currentProblemSubmissions, setCurrentProblemSubmissions] = useState([]);
  const [selectedProblemTitle, setSelectedProblemTitle] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [formDescription, setFormDescription] = useState('');
  const [formStatement, setFormStatement] = useState('');
  const [formConstraints, setFormConstraints] = useState('');
  const [formTimeLimit, setFormTimeLimit] = useState(5);
  const [formMemoryLimit, setFormMemoryLimit] = useState(256);

  // Testcase builder in modal
  const [testcases, setTestcases] = useState([]);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcExplanation, setNewTcExplanation] = useState('');
  const [newTcHidden, setNewTcHidden] = useState(false);

  // Template editor in modal
  const [templateLang, setTemplateLang] = useState('javascript');
  const [templateCode, setTemplateCode] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/coding', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProblems(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProblem(null);
    setFormTitle('');
    setFormDifficulty('medium');
    setFormDescription('');
    setFormStatement('');
    setFormConstraints('');
    setFormTimeLimit(5);
    setFormMemoryLimit(256);
    setTestcases([]);
    setModalTab('general');
    setShowEditorModal(true);
  };

  const handleOpenEditModal = async (problem) => {
    setEditingProblem(problem);
    setFormTitle(problem.title);
    setFormDifficulty(problem.difficulty_level);
    setFormDescription(problem.description);
    setFormStatement(problem.problem_statement || problem.description);
    setFormConstraints(problem.constraints || '');
    setFormTimeLimit(problem.time_limit_seconds || 5);
    setFormMemoryLimit(problem.memory_limit_mb || 256);
    setModalTab('general');

    // Fetch existing test cases
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problem.id}/testcases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTestcases(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch test cases:', err);
    }

    setShowEditorModal(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('edupredict-token');

    const payload = {
      title: formTitle,
      difficulty: formDifficulty,
      description: formDescription,
      problemStatement: formStatement,
      constraints: formConstraints,
      timeLimit: Number(formTimeLimit),
      memoryLimit: Number(formMemoryLimit),
      languages: ['javascript', 'python', 'cpp', 'java']
    };

    try {
      let url = 'http://localhost:5000/api/coding';
      let method = 'POST';

      if (editingProblem) {
        url = `http://localhost:5000/api/coding/${editingProblem.id}`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingProblem ? 'Problem updated!' : 'Problem created!');
        setShowEditorModal(false);
        fetchProblems();
      } else {
        alert(data.message || 'Error saving problem');
      }
    } catch (err) {
      console.error('Save problem error:', err);
      alert('Failed to save problem');
    }
  };

  const handleTogglePublish = async (problemId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}/publish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchProblems();
      } else {
        alert(data.message || 'Failed to update publish status');
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this coding problem? All submissions and test cases will be removed.')) {
      return;
    }

    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchProblems();
      } else {
        alert(data.message || 'Failed to delete problem');
      }
    } catch (err) {
      console.error('Delete problem error:', err);
    }
  };

  // Add test case
  const handleAddTestCase = async () => {
    if (!newTcInput || !newTcOutput) {
      alert('Input and Expected Output are required');
      return;
    }

    if (!editingProblem) {
      alert('Please save the problem first before adding test cases.');
      return;
    }

    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${editingProblem.id}/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          input: newTcInput,
          output: newTcOutput,
          explanation: newTcExplanation,
          isHidden: newTcHidden
        })
      });

      const data = await response.json();
      if (data.success) {
        setTestcases([...testcases, data.data]);
        setNewTcInput('');
        setNewTcOutput('');
        setNewTcExplanation('');
        setNewTcHidden(false);
      } else {
        alert(data.message || 'Failed to add testcase');
      }
    } catch (err) {
      console.error('Add test case error:', err);
    }
  };

  // Delete test case
  const handleDeleteTestCase = async (testcaseId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/testcases/${testcaseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTestcases(testcases.filter(tc => tc.id !== testcaseId));
      }
    } catch (err) {
      console.error('Delete testcase error:', err);
    }
  };

  // View submissions for problem
  const handleViewSubmissions = async (problemId, title) => {
    setSelectedProblemId(problemId);
    setSelectedProblemTitle(title);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}/submissions/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentProblemSubmissions(data.data);
        setShowSubmissionsModal(true);
      } else {
        alert(data.message || 'Failed to load submissions');
      }
    } catch (err) {
      console.error('View submissions error:', err);
    }
  };

  // Regrade submission
  const handleRegrade = async (submissionId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${selectedProblemId}/autograde`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ submissionId })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Regraded successfully! New score: ${data.data.score}%`);
        handleViewSubmissions(selectedProblemId, selectedProblemTitle);
      }
    } catch (err) {
      console.error('Regrade error:', err);
    }
  };

  return (
    <div className="coding-manager-page">
      <div className="manager-header">
        <div>
          <span className="eyebrow">Assessment Management</span>
          <h1>Coding Problems & Challenges</h1>
        </div>

        <div className="manager-toolbar">
          <NavLink to="/teacher" className="btn-sm-action" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Teacher Portal
          </NavLink>
          <button type="button" className="btn-primary-action" onClick={handleOpenCreateModal}>
            + Create New Problem
          </button>
        </div>
      </div>

      <div className="problems-card-panel">
        {loading ? (
          <p style={{ padding: '24px', color: 'var(--muted)' }}>Loading coding challenges...</p>
        ) : problems.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <h3>No coding problems created yet.</h3>
            <p style={{ color: 'var(--muted)', margin: '8px 0 20px' }}>
              Create your first algorithmic challenge with custom test cases and auto-grading.
            </p>
            <button type="button" className="btn-primary-action" onClick={handleOpenCreateModal}>
              Create Problem Now
            </button>
          </div>
        ) : (
          <table className="manager-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Test Cases</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                      {p.description?.substring(0, 60)}...
                    </div>
                  </td>
                  <td>
                    <span className={`badge-difficulty ${p.difficulty_level}`}>
                      {p.difficulty_level}
                    </span>
                  </td>
                  <td>{p.testcase_count || 0} Cases</td>
                  <td>
                    <button
                      type="button"
                      className="btn-sm-action"
                      onClick={() => handleViewSubmissions(p.id, p.title)}
                    >
                      {p.submission_count || 0} Submissions
                    </button>
                  </td>
                  <td>
                    <span className={`status-tag ${p.is_published ? 'published' : 'draft'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className="btn-sm-action"
                        onClick={() => handleTogglePublish(p.id)}
                      >
                        {p.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="btn-sm-action"
                        onClick={() => handleOpenEditModal(p)}
                      >
                        Edit
                      </button>
                      <NavLink
                        to={`/coding/${p.id}`}
                        target="_blank"
                        className="btn-sm-action"
                        style={{ textDecoration: 'none' }}
                      >
                        Preview
                      </NavLink>
                      <button
                        type="button"
                        className="btn-sm-action danger"
                        onClick={() => handleDeleteProblem(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Problem Editor / Creator Modal */}
      {showEditorModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box">
            <div className="modal-header-bar">
              <h2>{editingProblem ? `Edit: ${editingProblem.title}` : 'Create Coding Problem'}</h2>
              <button type="button" className="btn-close-modal" onClick={() => setShowEditorModal(false)}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
              <button
                className={`pane-tab-btn ${modalTab === 'general' ? 'active' : ''}`}
                style={{ color: modalTab === 'general' ? 'var(--primary)' : 'var(--muted)' }}
                onClick={() => setModalTab('general')}
              >
                1. Problem Details
              </button>
              <button
                className={`pane-tab-btn ${modalTab === 'testcases' ? 'active' : ''}`}
                style={{ color: modalTab === 'testcases' ? 'var(--primary)' : 'var(--muted)' }}
                onClick={() => setModalTab('testcases')}
              >
                2. Test Cases ({testcases.length})
              </button>
            </div>

            <div className="modal-body-scroll">
              {modalTab === 'general' && (
                <form id="problem-form" onSubmit={handleSaveProblem}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Problem Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Two Sum"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Difficulty Level</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Short Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief one-line summary for student cards"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Problem Statement (Markdown / Detailed Text) *</label>
                    <textarea
                      required
                      placeholder="Detailed explanation of the problem, input format, output format..."
                      rows={5}
                      value={formStatement}
                      onChange={(e) => setFormStatement(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Constraints</label>
                    <textarea
                      placeholder="e.g. 1 <= nums.length <= 10^5&#10;-10^9 <= target <= 10^9"
                      rows={3}
                      value={formConstraints}
                      onChange={(e) => setFormConstraints(e.target.value)}
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Time Limit (Seconds)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formTimeLimit}
                        onChange={(e) => setFormTimeLimit(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Memory Limit (MB)</label>
                      <input
                        type="number"
                        min="64"
                        max="1024"
                        value={formMemoryLimit}
                        onChange={(e) => setFormMemoryLimit(e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              )}

              {modalTab === 'testcases' && (
                <div>
                  <h3>Manage Test Cases</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '4px 0 16px' }}>
                    Add public sample test cases (shown in problem description) and hidden test cases (used for full grading).
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 12px' }}>+ Add New Test Case</h4>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Input Data *</label>
                        <input
                          type="text"
                          placeholder="e.g. [2,7,11,15], 9"
                          value={newTcInput}
                          onChange={(e) => setNewTcInput(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expected Output *</label>
                        <input
                          type="text"
                          placeholder="e.g. [0,1]"
                          value={newTcOutput}
                          onChange={(e) => setNewTcOutput(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Sample Explanation (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Because nums[0] + nums[1] == 9"
                        value={newTcExplanation}
                        onChange={(e) => setNewTcExplanation(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newTcHidden}
                          onChange={(e) => setNewTcHidden(e.target.checked)}
                        />
                        Is Hidden Test Case (Keep hidden from student problem description)
                      </label>

                      <button type="button" className="btn-primary-action" onClick={handleAddTestCase}>
                        Add Test Case
                      </button>
                    </div>
                  </div>

                  <h4>Existing Test Cases ({testcases.length})</h4>
                  {testcases.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No test cases configured yet.</p>
                  ) : (
                    testcases.map((tc, idx) => (
                      <div key={tc.id || idx} className="testcase-item-card">
                        <div className="testcase-item-header">
                          <span>
                            Case {idx + 1} {tc.is_hidden ? '🔒 (Hidden)' : '👁️ (Public Sample)'}
                          </span>
                          <button
                            type="button"
                            className="btn-sm-action danger"
                            onClick={() => handleDeleteTestCase(tc.id)}
                          >
                            Delete
                          </button>
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                          <div><strong>Input:</strong> {tc.input_data}</div>
                          <div><strong>Output:</strong> {tc.expected_output}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer-bar">
              <button type="button" className="btn-sm-action" onClick={() => setShowEditorModal(false)}>
                Cancel
              </button>
              {modalTab === 'general' ? (
                <button type="submit" form="problem-form" className="btn-primary-action">
                  {editingProblem ? 'Update Problem' : 'Create Problem'}
                </button>
              ) : (
                <button type="button" className="btn-primary-action" onClick={() => setShowEditorModal(false)}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Inspector Modal */}
      {showSubmissionsModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box">
            <div className="modal-header-bar">
              <h2>Student Submissions: {selectedProblemTitle}</h2>
              <button type="button" className="btn-close-modal" onClick={() => setShowSubmissionsModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body-scroll">
              {currentProblemSubmissions.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>
                  No student submissions for this challenge yet.
                </p>
              ) : (
                <table className="manager-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProblemSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.student_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{sub.student_email}</div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{sub.language}</td>
                        <td>
                          <span className={`status-tag ${sub.score === 100 ? 'published' : 'draft'}`}>
                            {sub.score === 100 ? 'Accepted' : 'Partial'}
                          </span>
                        </td>
                        <td><strong>{sub.score}%</strong></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-sm-action"
                            onClick={() => handleRegrade(sub.id)}
                          >
                            ↺ Regrade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer-bar">
              <button type="button" className="btn-sm-action" onClick={() => setShowSubmissionsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
