import { create } from 'zustand';

interface UIState {
  themeMode: 'light' | 'dark';
  isLoading: boolean;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  themeMode: 'light',
  isLoading: false,
  setThemeMode: themeMode => set({ themeMode }),
  setLoading: isLoading => set({ isLoading }),
}));
