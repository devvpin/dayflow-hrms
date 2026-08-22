import api from './api';

export const payrollService = {
  getMyPayroll: async () => {
    const response = await api.get('/api/payroll/me');
    return response.data;
  },
  
  getAllPayroll: async (params) => {
    const response = await api.get('/api/payroll', { params });
    return response.data;
  },
  
  createPayroll: async (data) => {
    const response = await api.post('/api/payroll', data);
    return response.data;
  },
  
  updatePayroll: async (id, data) => {
    const response = await api.put(`/api/payroll/${id}`, data);
    return response.data;
  }
};
