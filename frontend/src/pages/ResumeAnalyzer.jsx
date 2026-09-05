import { useState } from 'react';
import { analyzeResume } from '../services/api';
import './ResumeAnalyzer.css';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const sampleResume = `Aisha Khan - Software Engineer
Email: aisha@example.com | GitHub: github.com/aisha | LinkedIn: linkedin.com/in/aisha

EDUCATION
B.Tech in Computer Science and Engineering | CGPA: 8.8 / 10.0

TECHNICAL SKILLS
Languages: JavaScript, Python, C++, SQL
Frameworks & Tools: React, Node.js, Express, Docker, Git, REST API

EXPERIENCE & PROJECTS
Full-Stack EduPredict Platform:
- Engineered scalable student analytics portal reducing query latency by 45%.
- Architected multi-language sandbox code execution runner serving 500+ daily requests.
- Developed responsive dashboards using React and CSS Grid.

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- Meta Front-End Developer Specialization`;

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please paste your resume text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await analyzeResume(resumeText, targetRole, token);
      if (res.success) {
        setAnalysis(res.data);
      } else {
        setError(res.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      console.error('Resume analyze error:', err);
      setError('Error analyzing resume. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="resume-analyzer-page">
      <div className="page-header">
        <div>
          <span className="page-subtitle">AI Resume & ATS Optimization</span>
          <h1 className="page-title">📄 Smart ATS Resume Analyzer</h1>
          <p className="page-description">
            Scan your resume against real recruiter applicant tracking systems (ATS), keyword coverage, action verbs, and verified institutional credentials.
          </p>
        </div>
      </div>

      <div className="resume-grid">
        {/* Left Column: Input Form */}
        <div className="resume-card">
          <div className="card-header">
            <h2 className="card-title">📝 Resume Text Input</h2>
            <button
              type="button"
              className="sample-btn"
              onClick={() => setResumeText(sampleResume)}
            >
              Load Sample Resume
            </button>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label htmlFor="targetRole">Target Job Domain</label>
              <select
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="select-input"
              >
                <option value="Software Development">Software Development (Full-Stack / Backend)</option>
                <option value="Data Science & AI">Data Science, ML & AI Engineering</option>
                <option value="Web Development">Frontend & Web Development</option>
                <option value="Core Computer Science">Core CS / Systems & DSA</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resumeText">Paste Plain Text Resume</label>
              <textarea
                id="resumeText"
                rows="14"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the text from your resume here (Education, Experience, Projects, Skills, etc.)..."
                className="resume-textarea"
              />
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button
              type="submit"
              disabled={loading || !resumeText.trim()}
              className="scan-btn"
            >
              {loading ? '⚡ Scanning Resume with ATS AI...' : '🔍 Run ATS AI Compatibility Scan'}
            </button>
          </form>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="resume-card results-card">
          {!analysis ? (
            <div className="results-placeholder">
              <span className="placeholder-icon">📊</span>
              <h3>No Resume Scanned Yet</h3>
              <p>Paste your resume text on the left and click <strong>Run ATS AI Compatibility Scan</strong> to evaluate your recruiter readiness.</p>
            </div>
          ) : (
            <div className="results-content">
              {/* ATS Score Header */}
              <div className="ats-score-banner">
                <div className="ats-gauge">
                  <div
                    className="ats-circle"
                    style={{ borderColor: getScoreColor(analysis.ats_score) }}
                  >
                    <span className="score-num" style={{ color: getScoreColor(analysis.ats_score) }}>
                      {analysis.ats_score}
                    </span>
                    <span className="score-label">/ 100 ATS</span>
                  </div>
                </div>
                <div className="ats-meta">
                  <span className="grade-badge" style={{ background: `${getScoreColor(analysis.ats_score)}20`, color: getScoreColor(analysis.ats_score) }}>
                    Grade: {analysis.ats_grade}
                  </span>
                  <h3>ATS Compatibility Rating</h3>
                  <p>
                    Target Profile: <strong>{analysis.target_role}</strong> • Word Count: {analysis.word_count} words
                  </p>
                </div>
              </div>

              {/* Sections Detected Checklist */}
              <div className="analysis-section">
                <h4>📑 Essential Resume Sections</h4>
                <div className="sections-grid">
                  {Object.entries(analysis.sections_detected).map(([sec, detected]) => (
                    <div key={sec} className={`section-chip ${detected ? 'detected' : 'missing'}`}>
                      <span>{detected ? '✅' : '❌'}</span>
                      <span>{sec.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords Coverage */}
              <div className="analysis-section">
                <h4>🎯 Technical Keywords Match ({analysis.keyword_analysis?.coverage_percent}%)</h4>
                <div className="keywords-wrap">
                  {analysis.keyword_analysis?.matched_keywords?.map((kw, i) => (
                    <span key={i} className="keyword-tag matched">✓ {kw}</span>
                  ))}
                  {analysis.keyword_analysis?.missing_keywords?.map((kw, i) => (
                    <span key={i} className="keyword-tag missing">+ Missing: {kw}</span>
                  ))}
                </div>
              </div>

              {/* Verified Documents Cross-Reference */}
              {analysis.verified_cross_reference && (
                <div className="analysis-section verified-box">
                  <h4>🎓 Institutional Verification Cross-Reference</h4>
                  <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#475569' }}>
                    EduPredict verified <strong>{analysis.verified_cross_reference.verified_documents_count}</strong> official marksheets and certificates for your profile.
                  </p>
                  {analysis.verified_cross_reference.pending_verification_count > 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#d97706' }}>
                      ⚠️ {analysis.verified_cross_reference.pending_verification_count} document(s) still pending faculty verification.
                    </span>
                  )}
                </div>
              )}

              {/* Actionable Improvement Tips */}
              {analysis.improvement_suggestions?.length > 0 && (
                <div className="analysis-section">
                  <h4>💡 Prescriptive ATS Improvement Actions</h4>
                  <div className="tips-list">
                    {analysis.improvement_suggestions.map((tip, i) => (
                      <div key={i} className="tip-card">
                        <span className={`tip-badge ${tip.severity.toLowerCase()}`}>
                          {tip.severity}
                        </span>
                        <p>{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
