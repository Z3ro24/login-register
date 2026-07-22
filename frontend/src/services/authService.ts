import api from './apiService';
import type { User } from '../store/slices/auth.slice';
import type { LoginSchemaType, RegisterSchemaType } from '../validators/authValidator';

export const authService = {
  login: async (credentials: LoginSchemaType): Promise<User> => {
    const response = await api.post<User>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  register: async (userData: RegisterSchemaType): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  refresh: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/refresh');
    return response.data;
  },
};

export default authService;
