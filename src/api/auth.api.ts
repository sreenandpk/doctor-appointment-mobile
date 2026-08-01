import api from './axios';
import { User } from '@/types';
import { UserRole } from '@/constants';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout', { refreshToken });
    return response.data;
  },
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
  getProfile: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },
};

export default authApi;
