import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AssessmentBuilder.css';

export default function AssessmentBuilder() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [view, setView] = useState('list'); // list, create, edit, questions
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessmentType: 'aptitude',
    duration: 60,
    totalMarks: 100
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'mcq',
    marks: 1,
    difficulty: 'medium',
    category: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/assessments', {
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

  const fetchQuestions = async (assessmentId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setQuestions(data.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/assessments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        fetchAssessments();
        setFormData({ title: '', description: '', assessmentType: 'aptitude', duration: 60, totalMarks: 100 });
        setView('list');
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/assessments/${selectedAssessment.id}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionText: questionForm.questionText,
          questionType: questionForm.questionType,
          marks: parseFloat(questionForm.marks),
          difficulty: questionForm.difficulty,
          category: questionForm.category,
          options: questionForm.questionType === 'mcq' ? questionForm.options.filter(o => o) : null,
          correctAnswer: questionForm.correctAnswer
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchQuestions(selectedAssessment.id);
        setQuestionForm({
          questionText: '',
          questionType: 'mcq',
          marks: 1,
          difficulty: 'medium',
          category: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        });
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handlePublishAssessment = async (assessmentId) => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}/publish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchAssessments();
      }
    } catch (error) {
      console.error('Failed to publish assessment:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/assessments/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchQuestions(selectedAssessment.id);
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const categories = ['Aptitude', 'Reasoning', 'Verbal', 'Quantitative', 'Technical'];

  return (
    <section className="assessment-builder">
      <div className="page-header">
        <div>
          <span className="eyebrow">Assessment Studio</span>
          <h1>Create & Manage Tests</h1>
        </div>
      </div>

      {view === 'list' && (
        <div className="assessment-list-view">
          <button
            className="btn btn-primary"
            onClick={() => setView('create')}
            style={{ marginBottom: '24px' }}
          >
            + New Assessment
          </button>

          {loading ? (
            <p>Loading assessments...</p>
          ) : assessments.length > 0 ? (
            <div className="assessment-cards">
              {assessments.map((assessment) => (
                <div className="assessment-card" key={assessment.id}>
                  <div className="card-header">
                    <h3>{assessment.title}</h3>
                    <span className={`badge ${assessment.published_at ? 'published' : 'draft'}`}>
                      {assessment.published_at ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="card-description">{assessment.description}</p>
                  <div className="card-meta">
                    <span>{assessment.question_count} Questions</span>
                    <span>{assessment.total_marks} Marks</span>
                    <span>{assessment.duration} mins</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        fetchQuestions(assessment.id);
                        setView('questions');
                      }}
                      className="btn-secondary"
                    >
                      Manage Questions
                    </button>
                    {!assessment.published_at && (
                      <button
                        onClick={() => handlePublishAssessment(assessment.id)}
                        className="btn-success"
                      >
                        Publish
                      </button>
                    )}
                    {assessment.attempt_count > 0 && (
                      <button className="btn-info">View Results</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No assessments yet. Create one to get started!</p>
          )}
        </div>
      )}

      {view === 'create' && (
        <div className="assessment-form-view">
          <button onClick={() => setView('list')} className="btn-back">← Back</button>
          <form onSubmit={handleCreateAssessment} className="assessment-form">
            <div className="form-section">
              <h2>New Assessment</h2>
              
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Aptitude Mock Test 1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What is this assessment about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assessment Type *</label>
                  <select
                    value={formData.assessmentType}
                    onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                  >
                    <option value="aptitude">Aptitude</option>
                    <option value="coding">Coding</option>
                    <option value="general">General Knowledge</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min={15}
                    max={480}
                  />
                </div>

                <div className="form-group">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseFloat(e.target.value) })}
                    min={1}
                    step={0.5}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Assessment</button>
                <button type="button" onClick={() => setView('list')} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {view === 'questions' && selectedAssessment && (
        <div className="questions-view">
          <button onClick={() => setView('list')} className="btn-back">← Back</button>
          
          <div className="questions-header">
            <div>
              <h2>{selectedAssessment.title}</h2>
              <p>{questions.length} questions • {selectedAssessment.total_marks} marks • {selectedAssessment.duration} mins</p>
            </div>
            <span className={`badge ${selectedAssessment.published_at ? 'published' : 'draft'}`}>
              {selectedAssessment.published_at ? 'Published' : 'Draft'}
            </span>
          </div>

          <div className="add-question-section">
            <h3>Add Question</h3>
            <form onSubmit={handleAddQuestion} className="question-form">
              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  placeholder="Enter the question"
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  required
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {questionForm.questionType === 'mcq' && (
                <div className="form-group">
                  <label>Options</label>
                  <div className="options-list">
                    {questionForm.options.map((option, idx) => (
                      <div key={idx} className="option-input">
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                        />
                        <input
                          type="radio"
                          name="correct"
                          checked={questionForm.correctAnswer === idx}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                          title="Mark as correct"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary">Add Question</button>
            </form>
          </div>

          <div className="questions-list">
            <h3>Questions in this Assessment</h3>
            {questions.length > 0 ? (
              questions.map((q, idx) => (
                <div className="question-item" key={q.id}>
                  <div className="question-number">{idx + 1}</div>
                  <div className="question-content">
                    <p><strong>{q.question_text}</strong></p>
                    <div className="question-meta">
                      <span className="type-badge">{q.question_type}</span>
                      <span className="marks-badge">{q.marks} marks</span>
                      <span className={`difficulty-badge ${q.difficulty_level}`}>
                        {q.difficulty_level}
                      </span>
                      {q.category && <span className="category-badge">{q.category}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No questions added yet. Add questions above to continue.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
