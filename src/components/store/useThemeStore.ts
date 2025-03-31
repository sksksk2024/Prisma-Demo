import { create } from 'zustand';

type ThemeState = {
  theme: 'theme1' | 'theme2';
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'theme1',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'theme1' ? 'theme2' : 'theme1',
    })),
}));
