const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
}

export async function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function fetchCurrentUser(token) {
  return apiRequest('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Student Analytics API
export async function fetchStudentOverview(studentId, token) {
  return apiRequest(`/analytics/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchStudentAssessmentTrends(studentId, token) {
  return apiRequest(`/analytics/student/${studentId}/assessments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchStudentSkills(studentId, token) {
  return apiRequest(`/analytics/student/${studentId}/skills`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchStudentWeaknesses(studentId, token) {
  return apiRequest(`/analytics/student/${studentId}/weaknesses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Teacher Analytics API
export async function fetchTeacherClassSummary(teacherId, token) {
  return apiRequest(`/analytics/teacher/${teacherId}/class-summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchTeacherAtRiskStudents(teacherId, token) {
  return apiRequest(`/analytics/teacher/${teacherId}/at-risk`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchTeacherAssessmentAnalytics(teacherId, assessmentId, token) {
  return apiRequest(`/analytics/teacher/${teacherId}/assessments/${assessmentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Department & Admin Analytics API
export async function fetchDepartmentOverview(departmentId, token) {
  return apiRequest(`/analytics/department/${departmentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchDepartmentBatches(departmentId, token) {
  return apiRequest(`/analytics/department/${departmentId}/batches`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchDepartmentSkills(departmentId, token) {
  return apiRequest(`/analytics/department/${departmentId}/skills`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchAdminSystemOverview(token) {
  return apiRequest('/analytics/admin/system-overview', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchAdminDepartments(token) {
  return apiRequest('/analytics/admin/departments', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchAdminPlacementReadiness(token) {
  return apiRequest('/analytics/admin/placement-readiness', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ML Prediction & Explainability API
export async function fetchStudentPrediction(studentId, token) {
  return apiRequest(`/prediction/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchBatchPrediction(batchId, token) {
  return apiRequest(`/prediction/batch/${batchId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchModelMetadata(token) {
  return apiRequest('/prediction/model-info', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Phase 13: Resume AI & ATS Analyzer API
export async function analyzeResume(resumeText, targetRole, token) {
  return apiRequest('/student/resume/analyze', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ resume_text: resumeText, target_role: targetRole })
  });
}

// Phase 14: Generative Career AI Assistant API
export async function careerAiChat(message, history, token) {
  return apiRequest('/career-ai/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, history })
  });
}

export async function fetchMockInterviewQuestions(role, difficulty, token) {
  return apiRequest('/career-ai/mock-questions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role, difficulty })
  });
}

export async function fetchCareerRoadmap(targetGoal, token) {
  return apiRequest('/career-ai/roadmap', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ target_goal: targetGoal })
  });
}

export async function fetchCoverLetter(companyName, jobTitle, token) {
  return apiRequest('/career-ai/cover-letter', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ company_name: companyName, job_title: jobTitle })
  });
}

// Phase 15: Notifications API
export async function fetchNotifications(token) {
  return apiRequest('/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function markNotificationRead(id, token) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function markAllNotificationsRead(token) {
  return apiRequest('/notifications/read-all', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Phase 16: Reports & Exports API
export async function fetchStudentScorecard(studentId, token) {
  return apiRequest(`/reports/student/${studentId}/scorecard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getBatchExportCSVUrl(batchId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}/reports/batch/${batchId}/export`;
}

// Phase 19: Job Drives & Placement Cell API
export async function fetchJobDrives(token) {
  return apiRequest('/job-drives', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function applyJobDrive(driveId, token) {
  return apiRequest(`/job-drives/${driveId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createJobDrive(payload, token) {
  return apiRequest('/job-drives', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export async function fetchDriveCandidates(driveId, token) {
  return apiRequest(`/job-drives/${driveId}/candidates`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateCandidateStatus(applicationId, status, token) {
  return apiRequest(`/job-drives/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
}
