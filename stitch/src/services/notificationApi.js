import apiClient from './api';

export const notificationApi = {
  getMine: async () => (await apiClient('/notifications')).data,
  markAsRead: async (notificationId) => apiClient(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PUT' }),
  markAllAsRead: async () => apiClient('/notifications/read-all', { method: 'PUT' }),
  getStudentRecipients: async (search) => {
    const query = new URLSearchParams({ search }).toString();
    return (await apiClient(`/notifications/recipients?${query}`)).data;
  },
  sendToStudent: async (notification) => apiClient('/notifications/send', { body: notification })
};
