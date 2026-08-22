import api from './api';

export const notificationService = {
  getMyNotifications: async (params) => {
    const response = await api.get('/api/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  }
};
