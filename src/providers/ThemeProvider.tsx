import { useEffect } from 'react';

import { useThemeStore } from '@/stores/ui/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, isDarkMode } = useThemeStore();

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
    document.body.classList.toggle('dark', isDarkMode);
  }, [currentTheme, isDarkMode]);

  return <>{children}</>;
}
