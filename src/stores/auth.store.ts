import { create } from 'zustand';
import authApi, { LoginCredentials } from '@/api/auth.api';
import { saveToken, getToken, removeToken } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  setError: (error: string | null) => set({ error }),

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(credentials);
      
      // Save tokens securely in Keychain
      await saveToken(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await saveToken(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      await saveToken(STORAGE_KEYS.USER_ROLE, data.user.role);

      set({
        isAuthenticated: true,
        accessToken: data.accessToken,
        user: data.user,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await getToken(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Even if network logout fails, we still clean up the client state
    } finally {
      // Clear tokens from Keychain
      await removeToken(STORAGE_KEYS.ACCESS_TOKEN);
      await removeToken(STORAGE_KEYS.REFRESH_TOKEN);
      await removeToken(STORAGE_KEYS.USER_ROLE);

      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
        error: null,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const refreshToken = await getToken(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        set({ isLoading: false });
        return;
      }

      // Try refreshing to obtain a fresh access token
      const data = await authApi.refresh(refreshToken);
      await saveToken(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await saveToken(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      set({ accessToken: data.accessToken });

      // Fetch the latest profile info from backend
      const profileData = await authApi.getProfile();
      await saveToken(STORAGE_KEYS.USER_ROLE, profileData.user.role);

      set({
        isAuthenticated: true,
        user: profileData.user,
        isLoading: false,
      });
    } catch {
      // If restore fails, clear all tokens to avoid repeated attempts
      await removeToken(STORAGE_KEYS.ACCESS_TOKEN);
      await removeToken(STORAGE_KEYS.REFRESH_TOKEN);
      await removeToken(STORAGE_KEYS.USER_ROLE);
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
      });
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await getToken(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return null;
      }

      const data = await authApi.refresh(refreshToken);
      await saveToken(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await saveToken(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      set({ accessToken: data.accessToken });
      return data.accessToken;
    } catch {
      // If refreshing fails (e.g. token expired), we log out
      await get().logout();
      return null;
    }
  },
}));
