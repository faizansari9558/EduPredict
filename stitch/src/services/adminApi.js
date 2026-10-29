import apiClient from './api';

export const adminApi = {
  getUsers: async () => {
    return await apiClient('/admin/users');
  },

  getDepartments: async () => {
    return await apiClient('/admin/departments');
  },

  createDepartment: async (deptData) => {
    return await apiClient('/admin/departments', { body: deptData });
  },

  getSystemAudits: async () => {
    return await apiClient('/admin/audits');
  }
};

export const analyticsApi = {
  getCampusAnalytics: async () => {
    return await apiClient('/analytics/campus');
  },

  getDepartmentAnalytics: async (deptId) => {
    return await apiClient(`/analytics/department/${deptId}`);
  },
  getSystemOverview: () => apiClient('/analytics/admin/system-overview'),
  getDepartmentComparison: () => apiClient('/analytics/admin/departments'),
  getPlacementReadiness: () => apiClient('/analytics/admin/placement-readiness'),
  getCompensationTiers: () => apiClient('/analytics/admin/compensation-tiers')
};

export default { adminApi, analyticsApi };
