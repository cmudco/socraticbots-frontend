import { useLayoutEffect, useMemo } from 'react';

import type { BotTheme } from '@/types/bot';

const FONT_CLASSES = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
} as const;

const TEXT_SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
} as const;

const ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
} as const;

const SPACING_CLASSES = {
  compact: 'space-y-2',
  normal: 'space-y-4',
  relaxed: 'space-y-6',
} as const;

/**
 * Hook to apply bot-specific theme to a container element
 * Uses CSS custom properties scoped to the bot chat container
 */
export function useBotTheme(theme?: BotTheme, containerId = 'bot-chat-root') {
  // Apply CSS variables - runs after DOM updates
  useLayoutEffect(() => {
    if (!theme) return;

    let rafId: number | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    const applyTheme = () => {
      const container = document.getElementById(containerId);

      if (!container) {
        // Container not ready yet, retry with limit
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          rafId = requestAnimationFrame(applyTheme);
        }
        return;
      }

      // Apply CSS variables to the container
      const primaryColor = theme.primaryColor || '#8b5cf6';
      const accentColor = theme.accentColor || '#a78bfa';
      const backgroundColor = theme.backgroundColor || '#ffffff';
      const foregroundColor = theme.foregroundColor || '#0f172a';

      container.style.setProperty('--bot-primary', primaryColor);
      container.style.setProperty('--bot-accent', accentColor);
      container.style.setProperty('--bot-bg', backgroundColor);
      container.style.setProperty('--bot-fg', foregroundColor);
    };

    // Start applying theme
    applyTheme();

    // Cleanup on unmount or when theme changes
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      const container = document.getElementById(containerId);
      if (container) {
        container.style.removeProperty('--bot-primary');
        container.style.removeProperty('--bot-accent');
        container.style.removeProperty('--bot-bg');
        container.style.removeProperty('--bot-fg');
      }
    };
  }, [theme, containerId]);

  // Memoize computed class names
  const themeClasses = useMemo(
    () => ({
      fontClass: FONT_CLASSES[theme?.fontFamily || 'sans'],
      textSizeClass: TEXT_SIZE_CLASSES[theme?.fontSize || 'base'],
      roundedClass: ROUNDED_CLASSES[theme?.borderRadius || 'md'],
      spacingClass: SPACING_CLASSES[theme?.messageSpacing || 'normal'],
    }),
    [theme]
  );

  return themeClasses;
}
