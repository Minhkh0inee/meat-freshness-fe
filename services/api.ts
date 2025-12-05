import axios from 'axios';

// Tạo instance axios với cấu hình base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api-meatfreshness.minh-khoi.com",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - xử lý trước khi gửi request
api.interceptors.request.use(
  (config) => {
    // Thêm token authentication nếu có
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response
api.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 - token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401) {
      // Clear localStorage và chuyển về trang đăng nhập
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    console.error('Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;