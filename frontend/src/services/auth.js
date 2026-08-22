import api from './api';

export const authService = {
  login: async (credentials) => {
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);

    const response = await api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};
