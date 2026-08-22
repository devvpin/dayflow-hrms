import api from './api';

export const attendanceService = {
  getTodayAttendance: async () => {
    const response = await api.get('/api/attendance/me');
    // Map list to single attendance if necessary
    return Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
  },

  checkIn: async (data) => {
    const response = await api.post('/api/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data) => {
    const response = await api.post('/api/attendance/check-out', data);
    return response.data;
  },

  getHistory: async (params) => {
    const response = await api.get('/api/attendance/me', { params });
    return response.data;
  },

  getAllAttendance: async (params) => {
    const response = await api.get('/api/attendance', { params });
    return response.data;
  }
};
