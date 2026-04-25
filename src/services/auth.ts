import api from '@/lib/api/client';
import { ApiResponse, User, AuthResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export const authService = {
  login: async (data: LoginCredentials) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
    return response.data;
  },
};
