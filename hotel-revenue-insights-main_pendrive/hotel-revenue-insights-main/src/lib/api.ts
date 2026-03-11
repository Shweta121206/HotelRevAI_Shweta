import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; name: string; hotelName: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const bookingsAPI = {
  upload: (data: any) => api.post('/bookings/upload', data),
  list: () => api.get('/bookings/list'),
};

export const analyticsAPI = {
  demand: () => api.get('/analytics/demand'),
  pricing: () => api.get('/analytics/pricing'),
  revenue: () => api.get('/analytics/revenue'),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;