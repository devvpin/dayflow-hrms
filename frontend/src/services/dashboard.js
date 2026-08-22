import api from './api';

export const dashboardService = {
  getEmployeeStats: async () => {
    const response = await api.get('/api/dashboard/employee');
    return response.data;
  },
  
  getAdminStats: async () => {
    const response = await api.get('/api/dashboard/admin');
    return response.data;
  }
};
