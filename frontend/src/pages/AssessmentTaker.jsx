import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AssessmentTaker.css';

export default function AssessmentTaker() {
  const { assessmentId, attemptId } = useParams();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, in_progress, submitted, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [assessmentId]);

  useEffect(() => {
    if (status === 'in_progress' && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeRemaining]);

  const fetchAssessmentDetails = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAssessment(data.data);
        setQuestions(data.data.questions || []);
        setTimeRemaining(data.data.duration * 60); // Convert to seconds
        setStatus('in_progress');
        
        // Initialize answers object
        const initialAnswers = {};
        data.data.questions.forEach((q) => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmitAssessment = async () => {
    try {
      const token = localStorage.getItem('edupredict-token');
      
      // Submit all responses
      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer) {
          await fetch('http://localhost:5000/api/student/assessment/respond', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              attemptId,
              questionId: parseInt(questionId),
              answerText: answer
            })
          });
        }
      }

      // Mark assessment as submitted
      await fetch(`http://localhost:5000/api/student/assessment/${attemptId}/submit`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus('submitted');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <section className="assessment-taker"><p>Loading assessment...</p></section>;
  }

  if (status === 'error' || !assessment) {
    return <section className="assessment-taker"><p>Error loading assessment. Please try again.</p></section>;
  }

  if (status === 'submitted') {
    return (
      <section className="assessment-taker">
        <div className="submission-success">
          <h2>Assessment Submitted</h2>
          <p>Your responses have been recorded. Thank you!</p>
          <button onClick={() => window.history.back()} className="btn btn-primary">Back to Assessments</button>
        </div>
      </section>
    );
  }

  return (
    <section className="assessment-taker">
      <div className="taker-header">
        <div className="taker-info">
          <h2>{assessment.title}</h2>
          <p>{questions.length} Questions • {assessment.total_marks} Marks</p>
        </div>
        <div className="timer-section">
          <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
            Time: {formatTime(timeRemaining)}
          </div>
          <button onClick={handleSubmitAssessment} className="btn btn-danger">Submit Assessment</button>
        </div>
      </div>

      <div className="taker-container">
        <div className="questions-sidebar">
          <h3>Questions</h3>
          <div className="question-navigator">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`question-nav-item ${
                  idx === currentQuestionIndex ? 'active' : ''
                } ${answers[q.id] ? 'answered' : 'unanswered'}`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="question-display">
          {currentQuestion && (
            <div className="question-container">
              <div className="question-header">
                <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
                <div className="question-details">
                  <span>{currentQuestion.marks} marks</span>
                  <span className={`difficulty ${currentQuestion.difficulty_level}`}>
                    {currentQuestion.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="question-body">
                <p className="question-text">{currentQuestion.question_text}</p>

                {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                  <div className="mcq-options">
                    {currentQuestion.options.map((option, idx) => (
                      <label key={idx} className="option-label">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        />
                        <span className="option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.question_type === 'short_answer' && (
                  <textarea
                    className="answer-textarea"
                    placeholder="Enter your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    rows={4}
                  />
                )}

                {currentQuestion.question_type === 'essay' && (
                  <textarea
                    className="answer-textarea"
                    placeholder="Write your essay here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    rows={6}
                  />
                )}
              </div>

              <div className="navigation-buttons">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>
                <span className="progress-text">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="btn btn-secondary"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
