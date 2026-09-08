import apiClient from './api';
import { mockTeacherStudents } from '../data/mockTeacherData';

export const teacherApi = {
  getAssignedStudents: async () => {
    const data = await apiClient('/teacher/students');
    return data || mockTeacherStudents;
  },

  getPendingVerifications: async () => {
    return await apiClient('/teacher/verifications');
  },

  verifyItem: async (itemId, status, comments) => {
    return await apiClient(`/teacher/verifications/${itemId}`, {
      method: 'PUT',
      body: { status, comments }
    });
  }
};

export default teacherApi;
