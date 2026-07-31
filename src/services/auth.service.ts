import { useAuthStore } from '@/stores/auth.store';
import { LoginCredentials } from '@/api/auth.api';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    return useAuthStore.getState().login(credentials);
  },

  logout: async () => {
    return useAuthStore.getState().logout();
  },
};

export default authService;
