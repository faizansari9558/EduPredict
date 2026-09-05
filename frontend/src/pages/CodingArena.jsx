import { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CodingArena.css';

export default function CodingArena() {
  const { problemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('problem'); // 'problem' | 'submissions'

  // Execution states
  const [activeDockTab, setActiveDockTab] = useState('testcases'); // 'testcases' | 'custom' | 'result' | 'console'
  const [selectedTestcaseIdx, setSelectedTestcaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Run & Submit results
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setProblem(data.data);
        const defaultLang = data.data.supported_languages?.[0] || 'javascript';
        setSelectedLanguage(defaultLang);
        setCode(data.data.templates?.[defaultLang] || '// Write your code here\n');
        if (data.data.recent_submissions) {
          setSubmissionHistory(data.data.recent_submissions);
        }
      } else {
        setError(data.message || 'Failed to load problem');
      }
    } catch (err) {
      console.error('Error fetching coding problem:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    if (problem && problem.templates && problem.templates[newLang]) {
      setCode(problem.templates[newLang]);
    } else {
      setCode(`// Starter template for ${newLang}\n`);
    }
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset code to starter template? Your current changes will be overwritten.')) {
      if (problem && problem.templates && problem.templates[selectedLanguage]) {
        setCode(problem.templates[selectedLanguage]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const updatedCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(updatedCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Run against sample testcases or custom input
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveDockTab('result');
    try {
      const token = localStorage.getItem('edupredict-token');
      const payload = {
        code,
        language: selectedLanguage,
        customInput: activeDockTab === 'custom' ? customInput : null
      };

      const response = await fetch(`http://localhost:5000/api/coding/${problemId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (resData.success) {
        setRunResults(resData.data);
      } else {
        alert(resData.message || 'Run execution failed');
      }
    } catch (err) {
      console.error('Run code error:', err);
      alert('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code for full evaluation & autograding
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, language: selectedLanguage })
      });

      const resData = await response.json();
      if (resData.success) {
        setSubmitResult(resData.data);
        setShowSubmitModal(true);
        // Refresh submission history
        fetchSubmissions();
      } else {
        alert(resData.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error submitting code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/coding/${problemId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubmissionHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  if (loading) {
    return (
      <div className="coding-arena" style={{ display: 'grid', placeItems: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Loading Coding Arena Environment...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="coding-arena" style={{ display: 'grid', placeItems: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#f87171' }}>Unable to load problem</h2>
          <p style={{ color: '#94a3b8', margin: '12px 0 24px' }}>{error || 'Problem not found or unpublished.'}</p>
          <NavLink to="/student" className="btn-back-link">Return to Dashboard</NavLink>
        </div>
      </div>
    );
  }

  const lineCount = Math.max(code.split('\n').length, 18);
  const sampleTestcases = problem.testcases || [];
  const currentTestcase = sampleTestcases[selectedTestcaseIdx] || sampleTestcases[0];

  return (
    <div className="coding-arena">
      {/* Topbar */}
      <header className="arena-topbar">
        <div className="arena-title-wrap">
          <NavLink to={user?.role === 'teacher' ? '/teacher' : '/student'} className="btn-back-link">
            ← Back
          </NavLink>
          <h1>{problem.title}</h1>
          <span className={`badge-difficulty ${problem.difficulty_level}`}>
            {problem.difficulty_level}
          </span>
        </div>

        <div className="arena-actions-top">
          <span className="arena-meta-item">⏱ Time Limit: {problem.time_limit_seconds || 5}s</span>
          <span className="arena-meta-item">💾 Memory: {problem.memory_limit_mb || 256}MB</span>
        </div>
      </header>

      {/* Main Split Arena */}
      <div className="arena-workspace">
        {/* Left Pane: Problem Description / Submissions */}
        <section className="problem-pane">
          <nav className="pane-nav-tabs">
            <button
              className={`pane-tab-btn ${activeLeftTab === 'problem' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('problem')}
            >
              Description
            </button>
            <button
              className={`pane-tab-btn ${activeLeftTab === 'submissions' ? 'active' : ''}`}
              onClick={() => {
                setActiveLeftTab('submissions');
                fetchSubmissions();
              }}
            >
              Submissions ({submissionHistory.length})
            </button>
          </nav>

          <div className="pane-scrollable-content">
            {activeLeftTab === 'problem' && (
              <div>
                <p className="problem-statement-text">{problem.problem_statement || problem.description}</p>

                <h3 className="problem-section-title">Examples</h3>
                {sampleTestcases.map((tc, idx) => (
                  <div className="example-box" key={tc.id || idx}>
                    <h4>Example {idx + 1}:</h4>
                    <div className="example-line">
                      <span>Input:</span> {tc.input_data}
                    </div>
                    <div className="example-line">
                      <span>Output:</span> {tc.expected_output}
                    </div>
                    {tc.sample_explanation && (
                      <div className="example-line" style={{ marginTop: '6px' }}>
                        <span>Explanation:</span> {tc.sample_explanation}
                      </div>
                    )}
                  </div>
                ))}

                {problem.constraints && (
                  <div>
                    <h3 className="problem-section-title">Constraints</h3>
                    <div className="constraints-box">{problem.constraints}</div>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div>
                <h3 className="problem-section-title">My Recent Submissions</h3>
                {submissionHistory.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No submissions yet. Submit your solution to test your code!</p>
                ) : (
                  <table className="submissions-history-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Lang</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionHistory.map((sub) => (
                        <tr key={sub.id}>
                          <td>
                            <span style={{
                              color: sub.score === 100 ? '#34d399' : '#fbbf24',
                              fontWeight: 600
                            }}>
                              {sub.score === 100 ? 'Accepted' : 'Partial'}
                            </span>
                          </td>
                          <td><strong>{sub.score}%</strong></td>
                          <td style={{ textTransform: 'capitalize' }}>{sub.language}</td>
                          <td style={{ color: '#94a3b8' }}>
                            {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: Code Editor & Execution Runner */}
        <section className="editor-pane">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="lang-selector-group">
              <label htmlFor="lang-select" style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Language:</label>
              <select
                id="lang-select"
                className="lang-select"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                {(problem.supported_languages || ['javascript', 'python', 'cpp', 'java']).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'cpp' ? 'C++ (17)' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-actions-group">
              <button type="button" className="btn-tool" onClick={handleResetTemplate} title="Reset to template">
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Code Textarea with Line Numbers */}
          <div className="code-editor-wrapper">
            <div className="line-numbers">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>

          {/* Bottom Execution Dock */}
          <div className="execution-dock">
            <div className="dock-header">
              <div className="dock-tabs">
                <button
                  className={`dock-tab ${activeDockTab === 'testcases' ? 'active' : ''}`}
                  onClick={() => setActiveDockTab('testcases')}
                >
                  Sample Test Cases
                </button>
                <button
                  className={`dock-tab ${activeDockTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveDockTab('custom')}
                >
                  Custom Input
                </button>
                <button
                  className={`dock-tab ${activeDockTab === 'result' ? 'active' : ''}`}
                  onClick={() => setActiveDockTab('result')}
                >
                  Test Results {runResults && `(${runResults.passedTests}/${runResults.totalTests})`}
                </button>
              </div>

              <div className="dock-actions">
                <button
                  type="button"
                  className="btn-run"
                  disabled={isRunning || isSubmitting}
                  onClick={handleRunCode}
                >
                  {isRunning ? 'Running...' : '▶ Run Code'}
                </button>
                <button
                  type="button"
                  className="btn-submit-code"
                  disabled={isRunning || isSubmitting}
                  onClick={handleSubmitCode}
                >
                  {isSubmitting ? 'Submitting...' : '✓ Submit'}
                </button>
              </div>
            </div>

            <div className="dock-content">
              {/* Test Cases View */}
              {activeDockTab === 'testcases' && (
                <div>
                  <div className="testcase-pill-list">
                    {sampleTestcases.map((_, i) => (
                      <button
                        key={i}
                        className={`testcase-pill ${selectedTestcaseIdx === i ? 'active' : ''}`}
                        onClick={() => setSelectedTestcaseIdx(i)}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {currentTestcase && (
                    <div className="testcase-detail-box">
                      <div className="io-row">
                        <span className="io-label">Input</span>
                        <div className="io-val">{currentTestcase.input_data}</div>
                      </div>
                      <div className="io-row">
                        <span className="io-label">Expected Output</span>
                        <div className="io-val">{currentTestcase.expected_output}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Input View */}
              {activeDockTab === 'custom' && (
                <div>
                  <textarea
                    className="custom-input-box"
                    placeholder="Enter custom input arguments (e.g. [2,7,11,15], 9)..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              )}

              {/* Run Results View */}
              {activeDockTab === 'result' && (
                <div>
                  {!runResults ? (
                    <p style={{ color: '#64748b', margin: 0 }}>Click "Run Code" to test your solution against sample cases.</p>
                  ) : (
                    <div>
                      <div className={`status-banner ${runResults.allPassed ? 'success' : 'error'}`}>
                        <span>{runResults.allPassed ? '✓ All Sample Test Cases Passed' : '✗ Some Test Cases Failed'}</span>
                        <span>{runResults.passedTests} / {runResults.totalTests} Passed</span>
                      </div>

                      {runResults.results.map((res, i) => (
                        <div key={i} className="testcase-detail-box" style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: res.passed ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {res.isCustom ? 'Custom Test' : `Test Case ${i + 1}`}: {res.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              ⏱ {res.executionTimeMs}ms • 💾 {res.memoryUsedMb}MB
                            </span>
                          </div>

                          <div className="io-row">
                            <span className="io-label">Input:</span>
                            <div className="io-val">{res.input}</div>
                          </div>
                          <div className="io-row">
                            <span className="io-label">Your Output:</span>
                            <div className="io-val" style={{ color: res.passed ? '#34d399' : '#f87171' }}>
                              {res.actualOutput || '(No output)'}
                            </div>
                          </div>
                          {!res.isCustom && (
                            <div className="io-row">
                              <span className="io-label">Expected Output:</span>
                              <div className="io-val">{res.expectedOutput}</div>
                            </div>
                          )}
                          {res.errorMessage && (
                            <div className="io-row">
                              <span className="io-label" style={{ color: '#f87171' }}>Error:</span>
                              <div className="io-val" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)' }}>
                                {res.errorMessage}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Submission Complete Modal */}
      {showSubmitModal && submitResult && (
        <div className="submission-modal-overlay">
          <div className="submission-modal-card">
            <div className="modal-trophy">{submitResult.isAccepted ? '🏆' : '🎯'}</div>
            <h2 style={{ margin: '0', color: submitResult.isAccepted ? '#34d399' : '#fbbf24' }}>
              {submitResult.isAccepted ? 'Solution Accepted!' : 'Submission Processed'}
            </h2>
            <div className="modal-score-big">{submitResult.score}%</div>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Passed {submitResult.passedCount} out of {submitResult.totalCount} total test cases (including hidden tests).
            </p>

            <div className="modal-metrics-grid">
              <div className="modal-metric-card">
                <p>Status</p>
                <h4 style={{ color: submitResult.isAccepted ? '#34d399' : '#fbbf24' }}>
                  {submitResult.isAccepted ? 'Accepted' : 'Partial'}
                </h4>
              </div>
              <div className="modal-metric-card">
                <p>Score Earned</p>
                <h4>{submitResult.score} / 100</h4>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-tool"
                style={{ padding: '10px 24px', fontSize: '0.9rem', color: '#f8fafc' }}
                onClick={() => setShowSubmitModal(false)}
              >
                Keep Coding
              </button>
              <NavLink
                to="/student"
                className="btn-submit-code"
                style={{ padding: '10px 24px', fontSize: '0.9rem', textDecoration: 'none' }}
              >
                Back to Dashboard
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
