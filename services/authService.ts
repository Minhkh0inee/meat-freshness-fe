import api from './api';
import { User } from '../context/AuthContext';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;  // Chỉ có access token
}

export const authAPI = {
  // Đăng nhập
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  // Đăng ký
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Đăng xuất
  signOut: async (): Promise<void> => {
    await api.post('/auth/signout');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset mật khẩu
  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};

// Error handler helper
export const handleAuthError = (error: any): string => {
  if (error.response) {
    // Server trả về lỗi
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Dữ liệu không hợp lệ';
      case 401:
        return 'Email hoặc mật khẩu không đúng';
      case 409:
        return 'Email này đã được đăng ký';
      case 422:
        return data?.message || 'Dữ liệu không hợp lệ';
      case 500:
        return 'Lỗi server. Vui lòng thử lại sau';
      default:
        return data?.message || 'Có lỗi xảy ra';
    }
  } else if (error.request) {
    // Network error
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng';
  } else {
    // Other error
    return error.message || 'Có lỗi không xác định';
  }
};