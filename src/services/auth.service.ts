import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { saveToken, removeToken } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

export const authService = {
  login: async (credentials: any) => {
    const data = await authApi.login(credentials);
    const { accessToken, refreshToken, user } = data.data;

    await saveToken(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await saveToken(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    useAuthStore.getState().setAuth(user);

    return data;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Clean up local credentials regardless of network failure
    }
    await removeToken(STORAGE_KEYS.ACCESS_TOKEN);
    await removeToken(STORAGE_KEYS.REFRESH_TOKEN);
    useAuthStore.getState().clearAuth();
  },
};

export default authService;
