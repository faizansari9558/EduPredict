import { useState } from 'react';
import {
  careerAiChat,
  fetchMockInterviewQuestions,
  fetchCareerRoadmap,
  fetchCoverLetter
} from '../services/api';
import './CareerAssistant.css';

export default function CareerAssistant() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'interview' | 'roadmap' | 'cover_letter'

  // Chat state
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your EduPredict AI Career Copilot. I'm connected to your academic marks, assessment results, and ML placement forecast. How can I guide you today?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Mock interview state
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewDiff, setInterviewDiff] = useState('Medium');
  const [interviewData, setInterviewData] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Roadmap state
  const [roadmapGoal, setRoadmapGoal] = useState('Full-Stack Software Engineer');
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Cover letter state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [coverLetterData, setCoverLetterData] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handlers
  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await careerAiChat(textToSend, messages, token);
      if (res.success && res.data) {
        setMessages([...newMsgs, { sender: 'ai', text: res.data.reply, followups: res.data.suggested_followups }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([...newMsgs, { sender: 'ai', text: 'I encountered an error connecting to the career service. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    setInterviewLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchMockInterviewQuestions(interviewRole, interviewDiff, token);
      if (res.success) {
        setInterviewData(res.data);
      }
    } catch (err) {
      console.error('Interview generator error:', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchCareerRoadmap(roadmapGoal, token);
      if (res.success) {
        setRoadmapData(res.data);
      }
    } catch (err) {
      console.error('Roadmap error:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) return;
    setCoverLoading(true);
    setCopied(false);
    try {
      const token = localStorage.getItem('edupredict-token');
      const res = await fetchCoverLetter(companyName, jobTitle, token);
      if (res.success) {
        setCoverLetterData(res.data);
      }
    } catch (err) {
      console.error('Cover letter error:', err);
    } finally {
      setCoverLoading(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (coverLetterData?.letter_text) {
      navigator.clipboard.writeText(coverLetterData.letter_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="career-assistant-page">
      <div className="page-header">
        <div>
          <span className="page-subtitle">Generative AI Career Copilot</span>
          <h1 className="page-title">🤖 AI Career & Interview Copilot</h1>
          <p className="page-description">
            Personalized guidance grounded in your real academic grades, coding performance, and machine learning placement forecasts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="career-tabs">
        <button
          type="button"
          className={`career-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Career Chat Copilot
        </button>
        <button
          type="button"
          className={`career-tab ${activeTab === 'interview' ? 'active' : ''}`}
          onClick={() => setActiveTab('interview')}
        >
          🎯 Mock Interview Questions
        </button>
        <button
          type="button"
          className={`career-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          🗺️ 30-60-90 Day Roadmap
        </button>
        <button
          type="button"
          className={`career-tab ${activeTab === 'cover_letter' ? 'active' : ''}`}
          onClick={() => setActiveTab('cover_letter')}
        >
          📝 AI Cover Letter
        </button>
      </div>

      {/* Tab 1: Chat Copilot */}
      {activeTab === 'chat' && (
        <div className="career-card chat-card">
          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-wrap ${m.sender}`}>
                <div className={`chat-avatar ${m.sender}`}>
                  {m.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="chat-content-wrap">
                  <div className={`chat-bubble ${m.sender}`}>
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{m.text}</p>
                  </div>
                  {m.followups && (
                    <div className="followups-row">
                      {m.followups.map((f, fi) => (
                        <button
                          key={fi}
                          type="button"
                          className="followup-chip"
                          onClick={() => handleSendMessage(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble-wrap ai">
                <div className="chat-avatar ai">🤖</div>
                <div className="chat-bubble ai typing">Thinking & analyzing profile...</div>
              </div>
            )}
          </div>

          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask about interview strategies, resume tips, salary expectations, or skill prep..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}>
              Send 🚀
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Mock Interview Generator */}
      {activeTab === 'interview' && (
        <div className="career-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">🎯 Profile-Aware Mock Technical Interview</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Generates questions calibrated to your verified skills and target role.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={interviewRole}
                onChange={(e) => setInterviewRole(e.target.value)}
                className="select-input"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
              <button
                type="button"
                className="action-btn-primary"
                onClick={handleGenerateInterview}
                disabled={interviewLoading}
              >
                {interviewLoading ? 'Generating...' : '⚡ Generate Questions'}
              </button>
            </div>
          </div>

          {!interviewData ? (
            <div className="empty-state">
              <span style={{ fontSize: '2.5rem' }}>🎯</span>
              <p>Select your target role above and click <strong>Generate Questions</strong> to start practicing.</p>
            </div>
          ) : (
            <div className="questions-list">
              {interviewData.questions.map((q) => (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <span className="q-badge">{q.category}</span>
                    <span className="q-num">Question #{q.id}</span>
                  </div>
                  <h3 className="q-text">{q.question}</h3>
                  <div className="q-concepts">
                    {q.key_concepts.map((c, ci) => (
                      <span key={ci} className="concept-tag">📌 {c}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="toggle-answer-btn"
                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                  >
                    {expandedQuestion === q.id ? '▲ Hide Answer Outline' : '▼ View Model Answer Framework'}
                  </button>

                  {expandedQuestion === q.id && (
                    <div className="answer-framework">
                      <strong>💡 Recommended Answer Structure:</strong>
                      <p>{q.sample_answer_framework}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="career-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">🗺️ 30-60-90 Day Skill Mastery Roadmap</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Structured milestones to advance your placement tier from current standing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={roadmapGoal}
                onChange={(e) => setRoadmapGoal(e.target.value)}
                placeholder="Target Goal (e.g. SDE-1 at Product Company)"
                className="select-input"
                style={{ width: '260px' }}
              />
              <button
                type="button"
                className="action-btn-primary"
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading}
              >
                {roadmapLoading ? 'Building...' : '🗺️ Build Roadmap'}
              </button>
            </div>
          </div>

          {!roadmapData ? (
            <div className="empty-state">
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <p>Enter your career goal and click <strong>Build Roadmap</strong> to synthesize your personalized plan.</p>
            </div>
          ) : (
            <div className="roadmap-milestones">
              {roadmapData.milestones.map((m, idx) => (
                <div key={idx} className="milestone-card">
                  <div className="milestone-marker">{idx + 1}</div>
                  <div className="milestone-content">
                    <h3 className="milestone-phase">{m.phase}</h3>
                    <span className="milestone-focus">🎯 Core Focus: {m.focus}</span>
                    <ul className="milestone-tasks">
                      {m.tasks.map((t, ti) => (
                        <li key={ti}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Cover Letter */}
      {activeTab === 'cover_letter' && (
        <div className="career-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">📝 Tailored AI Cover Letter Generator</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Crafts a professional cover letter highlighting your verified coursework, projects, and CGPA.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateCoverLetter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Target Company</label>
              <input
                type="text"
                placeholder="e.g. Google, Microsoft, Amazon"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="select-input"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Job Title / Position</label>
              <input
                type="text"
                placeholder="e.g. Software Development Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="select-input"
                required
              />
            </div>
            <button
              type="submit"
              className="action-btn-primary"
              disabled={coverLoading || !companyName.trim()}
              style={{ height: '42px' }}
            >
              {coverLoading ? 'Writing...' : '✨ Generate Cover Letter'}
            </button>
          </form>

          {coverLetterData && (
            <div className="cover-letter-preview">
              <div className="cover-letter-header">
                <span>📄 Generated for {coverLetterData.company_name} ({coverLetterData.job_title})</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyCoverLetter}
                >
                  {copied ? '✅ Copied to Clipboard!' : '📋 Copy Text'}
                </button>
              </div>
              <pre className="cover-letter-body">{coverLetterData.letter_text}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
