import { create } from 'zustand';

type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
};

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('app-theme') as Theme;
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: next };
  }),
}));

// Apply initial class immediately
if (typeof window !== 'undefined') {
  if (getInitialTheme() === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
