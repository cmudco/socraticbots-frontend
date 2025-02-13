// src/providers/ThemeProvider.tsx
import { useEffect } from 'react';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        const savedColors = localStorage.getItem('theme-colors');
        if (savedColors) {
            const colors = JSON.parse(savedColors);
            document.documentElement.style.setProperty('--color-socratic-light', colors.light);
            document.documentElement.style.setProperty('--color-socratic', colors.DEFAULT);
            document.documentElement.style.setProperty('--color-socratic-dark', colors.dark);
            document.documentElement.style.setProperty('--color-socratic-font-light', colors.fontLight);
            document.documentElement.style.setProperty('--color-socratic-font-dark', colors.fontDark);
        }
    }, []);

    return <>{children}</>;
};

export default ThemeProvider;
