import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors with clear logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Error] Network Error - Không thể kết nối đến server');
      console.error('- Kiểm tra backend đã chạy chưa');
      console.error('- Kiểm tra CORS đã được cấu hình');
      console.error(`- URL: ${API_BASE_URL}`);
    } else if (error.response) {
      console.error(`[API Error] ${error.response.status} - ${error.response.statusText}`);
      console.error('Response:', error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('[API Error] No response received');
      console.error('Request:', error.request);
    } else {
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
