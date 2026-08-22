import api from './api';

export const attendanceService = {
  getTodayAttendance: async () => {
    const response = await api.get('/api/attendance/today');
    return response.data;
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
    const response = await api.get('/api/attendance/history', { params });
    return response.data;
  },
  
  getAllAttendance: async (params) => {
    const response = await api.get('/api/attendance', { params });
    return response.data;
  }
};
