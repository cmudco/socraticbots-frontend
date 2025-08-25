import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName =
  | 'amber-minimal'
  | 'amethyst-haze'
  | 'bold-tech'
  | 'sunset-horizon'
  | 'twitter'
  | 'bubblegum'
  | 'caffeine'
  | 't3-chat'
  | 'ocean-breeze';

export interface ThemeState {
  currentTheme: ThemeName;
  isDarkMode: boolean;
}

export interface ThemeActions {
  setTheme: (theme: ThemeName) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'amethyst-haze',
      isDarkMode: false,

      // Actions
      setTheme: (theme: ThemeName) => {
        set({ currentTheme: theme });
        document.body.setAttribute('data-theme', theme);
      },

      toggleDarkMode: () => {
        const { isDarkMode } = get();
        const newDarkMode = !isDarkMode;
        set({ isDarkMode: newDarkMode });

        document.body.classList.toggle('dark', newDarkMode);
      },

      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        document.body.classList.toggle('dark', isDark);
      },
    }),
    {
      name: 'socratic-theme-storage',
      partialize: state => ({
        currentTheme: state.currentTheme,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
