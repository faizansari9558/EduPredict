import apiClient, { API_BASE_URL, getAuthToken } from './api';

function queryString(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
}

export const teacherApi = {
  getDashboard: () => apiClient('/teacher/dashboard'),
  getAnalytics: () => apiClient('/teacher/analytics'),
  getAssignedStudents: (params = {}) => apiClient(`/teacher/students${queryString(params)}`),
  getStudentDetails: (studentId) => apiClient(`/teacher/students/${studentId}`),

  getPendingVerifications: async () => {
    return await apiClient('/teacher/verifications');
  },

  downloadVerificationFile: async (itemId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teacher/verifications/${itemId}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.blob();
  },

  verifyItem: async (itemId, status, comments) => {
    return await apiClient(`/teacher/verifications/${itemId}`, {
      method: 'PUT',
      body: { status, comments }
    });
  },
  getAssessments: (params = {}) => apiClient(`/teacher/assessments${queryString(params)}`),
  createAssessment: (assessment) => apiClient('/teacher/assessments', { body: assessment }),
  publishAssessment: (assessmentId) => apiClient(`/teacher/assessments/${assessmentId}/publish`, {
    method: 'PATCH'
  }),
  getAssessmentResults: (assessmentId) => apiClient(`/teacher/assessments/${assessmentId}/results`)
};

export default teacherApi;
