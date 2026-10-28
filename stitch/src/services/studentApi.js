import apiClient from './api';
export const studentApi = {
  getProfile: async () => {
    const res = await apiClient('/student/profile');
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

  getPlacementPrediction: async (studentId) => {
    if (!studentId) throw new Error('A server-authenticated student ID is required.');
    const res = await apiClient(`/prediction/student/${studentId}`);
    return res.data;
  },

  submitDocument: async (formData) => {
    return await apiClient('/student/documents', { body: formData, headers: {} });
  },
  getPortfolio: async (itemType) => (await apiClient(`/student/portfolio/${itemType}`)).data,
  addPortfolioItem: async (itemType, payload) => (await apiClient(`/student/portfolio/${itemType}`, { body: payload })).data,

  getAssessments: async () => {
    const res = await apiClient('/student/assessments');
    return res && res.data;
  }
};

export default studentApi;
