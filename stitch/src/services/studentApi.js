import apiClient, { API_BASE_URL, getAuthToken } from './api';
export const studentApi = {
  getProfile: async () => {
    const res = await apiClient('/student/profile');
    return res.data;
  },

  updateAcademicRecords: async (formData) => apiClient('/student/academic-records', {
    method: 'PUT',
    body: formData,
    headers: {}
  }),

  getDocuments: async () => {
    const res = await apiClient('/student/documents');
    return res.data;
  },

  getDashboard: async () => {
    const res = await apiClient('/student/dashboard');
    return res.data;
  },

  getProjects: async () => {
    const res = await apiClient('/student/portfolio/project');
    return res.data;
  },

  getCertifications: async () => {
    const res = await apiClient('/student/portfolio/certification');
    return res.data;
  },

  getSkills: async () => {
    const res = await apiClient('/student/skills');
    return res.data;
  },

  addSkill: async (skill) => {
    const res = await apiClient('/student/skills', { body: skill });
    return res.data;
  },

  getPlacementPrediction: async () => {
    const res = await apiClient('/prediction/me');
    return res.data;
  },

  getResults: async () => {
    const res = await apiClient('/student/results');
    return res.data;
  },

  submitDocument: async (formData) => {
    return await apiClient('/student/documents', { body: formData, headers: {} });
  },
  getPortfolio: async (itemType) => (await apiClient(`/student/portfolio/${itemType}`)).data,
  addPortfolioItem: async (itemType, payload) => (await apiClient(`/student/portfolio/${itemType}`, { body: payload })).data,
  downloadDocument: async (documentId) => {
    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/student/documents/${encodeURIComponent(documentId)}/download`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Unable to download certificate (${response.status}).`);
    }
    return response.blob();
  },
  analyzeResume: async (formData) => (await apiClient('/student/resume/analyze', { body: formData })).data,

  getAssessments: async () => {
    const res = await apiClient('/student/assessments');
    return res && res.data;
  }
};

export default studentApi;
