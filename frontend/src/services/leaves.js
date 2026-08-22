import api from './api';

export const leaveService = {
  getMyLeaves: async (params) => {
    const response = await api.get('/api/leaves/me', { params });
    return response.data;
  },
  
  applyLeave: async (data) => {
    const response = await api.post('/api/leaves', data);
    return response.data;
  },
  
  getAllLeaves: async (params) => {
    const response = await api.get('/api/leaves', { params });
    return response.data;
  },
  
  updateLeaveStatus: async (id, data) => {
    const response = await api.patch(`/api/leaves/${id}/status`, data);
    return response.data;
  }
};
