import apiClient from './api';
import {
  mockStudentOverview,
  mockStudentProjects,
  mockStudentCertifications,
  mockPlacementDrivers
} from '../data/mockStudentData';

export const studentApi = {
  getProfile: async () => {
    const res = await apiClient('/student/profile');
    return (res && res.data) || mockStudentOverview;
  },

  getDashboard: async () => {
    const res = await apiClient('/student/dashboard');
    return (res && res.data) || mockStudentOverview;
  },

  getProjects: async () => {
    const res = await apiClient('/student/documents');
    return (res && res.data) || mockStudentProjects;
  },

  getCertifications: async () => {
    const res = await apiClient('/student/documents');
    return (res && res.data) || mockStudentCertifications;
  },

  getPlacementPrediction: async (studentId = 5) => {
    const res = await apiClient(`/prediction/student/${studentId}`);
    return (res && res.data) || mockPlacementDrivers;
  },

  submitDocument: async (docData) => {
    return await apiClient('/student/documents', { body: docData });
  },

  getAssessments: async () => {
    const res = await apiClient('/student/assessments');
    return res && res.data;
  }
};

export default studentApi;
