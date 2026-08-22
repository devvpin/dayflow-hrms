import api from './api';

export const employeeService = {
  getAllEmployees: async (params) => {
    const response = await api.get('/api/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/employees/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/employees/me', data);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post('/api/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/api/employees/${id}`);
    return response.data;
  }
};
