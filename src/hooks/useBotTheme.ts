import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

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

// Default theme values to prevent undefined issues
const DEFAULT_THEME: Required<Omit<BotTheme, 'id' | 'createdAt' | 'updatedAt'>> = {
  primaryColor: '#8b5cf6',
  accentColor: '#a78bfa',
  backgroundColor: '#ffffff',
  foregroundColor: '#0f172a',
  fontFamily: 'sans',
  fontSize: 'base',
  borderRadius: 'md',
  messageSpacing: 'normal',
};

/**
 * Hook to apply bot-specific theme to a container element
 * Uses CSS custom properties scoped to the bot chat container
 *
 * IMPROVED: Handles race conditions and ensures theme is applied reliably
 */
export function useBotTheme(theme?: BotTheme, containerId = 'bot-chat-root') {
  const observerRef = useRef<MutationObserver | null>(null);
  const appliedRef = useRef<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Merge theme with defaults to ensure all values are present
  const resolvedTheme = useMemo(() => {
    if (!theme) return DEFAULT_THEME;

    return {
      primaryColor: theme.primaryColor || DEFAULT_THEME.primaryColor,
      accentColor: theme.accentColor || DEFAULT_THEME.accentColor,
      backgroundColor: theme.backgroundColor || DEFAULT_THEME.backgroundColor,
      foregroundColor: theme.foregroundColor || DEFAULT_THEME.foregroundColor,
      fontFamily: theme.fontFamily || DEFAULT_THEME.fontFamily,
      fontSize: theme.fontSize || DEFAULT_THEME.fontSize,
      borderRadius: theme.borderRadius || DEFAULT_THEME.borderRadius,
      messageSpacing: theme.messageSpacing || DEFAULT_THEME.messageSpacing,
    };
  }, [theme]);

  // Function to apply theme to container
  const applyThemeToContainer = useMemo(() => {
    return (container: HTMLElement, themeData: typeof resolvedTheme) => {
      try {
        // Apply CSS variables to the container
        container.style.setProperty('--bot-primary', themeData.primaryColor);
        container.style.setProperty('--bot-accent', themeData.accentColor);
        container.style.setProperty('--bot-bg', themeData.backgroundColor);
        container.style.setProperty('--bot-fg', themeData.foregroundColor);

        // Mark as applied
        container.setAttribute('data-theme-applied', 'true');
        appliedRef.current = true;

        if (import.meta.env.DEV) {
          console.log(`[useBotTheme] Theme applied to container: ${containerId}`, themeData);
        }

        return true;
      } catch (error) {
        console.error(`[useBotTheme] Error applying theme to container ${containerId}:`, error);
        return false;
      }
    };
  }, [containerId]);

  // Function to remove theme from container
  const removeThemeFromContainer = useMemo(() => {
    return (container: HTMLElement) => {
      try {
        container.style.removeProperty('--bot-primary');
        container.style.removeProperty('--bot-accent');
        container.style.removeProperty('--bot-bg');
        container.style.removeProperty('--bot-fg');
        container.removeAttribute('data-theme-applied');
        appliedRef.current = false;

        if (import.meta.env.DEV) {
          console.log(`[useBotTheme] Theme removed from container: ${containerId}`);
        }
      } catch (error) {
        console.error(`[useBotTheme] Error removing theme from container ${containerId}:`, error);
      }
    };
  }, [containerId]);

  // Strategy 1: Try immediate synchronous application (useLayoutEffect)
  // This runs before browser paint, ensuring no flash of unstyled content
  // Always re-apply when resolvedTheme changes (not gated by appliedRef)
  useLayoutEffect(() => {
    const container = document.getElementById(containerId);

    if (container) {
      applyThemeToContainer(container, resolvedTheme);
    }
  }, [containerId, resolvedTheme, applyThemeToContainer]);

  // Strategy 2: Setup MutationObserver and polling as fallback
  // This handles cases where the container mounts after the effect runs
  useEffect(() => {
    // If already applied, no need for fallback
    if (appliedRef.current) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 50; // 50 attempts * 100ms = 5 seconds max

    // Function to attempt theme application
    const attemptApply = (): boolean => {
      const container = document.getElementById(containerId);

      if (container) {
        const success = applyThemeToContainer(container, resolvedTheme);
        if (success) {
          // Clear all retry mechanisms
          if (timeoutId) clearTimeout(timeoutId);
          if (intervalId) clearInterval(intervalId);
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
          return true;
        }
      }
      return false;
    };

    // Polling mechanism: Try every 100ms for up to 5 seconds
    intervalId = setInterval(() => {
      attempts++;

      if (attemptApply() || attempts >= MAX_ATTEMPTS) {
        if (intervalId) clearInterval(intervalId);

        if (attempts >= MAX_ATTEMPTS && !appliedRef.current) {
          console.warn(
            `[useBotTheme] Failed to apply theme after ${MAX_ATTEMPTS} attempts. Container may not exist: ${containerId}`
          );
        }
      }
    }, 100);

    // MutationObserver: Watch for the container to be added to DOM
    observerRef.current = new MutationObserver(() => {
      attemptApply();
    });

    // Observe the entire document body for added nodes
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial immediate attempt
    timeoutId = setTimeout(() => {
      attemptApply();
    }, 0);

    // Cleanup function
    cleanupRef.current = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      const container = document.getElementById(containerId);
      if (container && appliedRef.current) {
        removeThemeFromContainer(container);
      }
    };

    return cleanupRef.current;
  }, [containerId, resolvedTheme, applyThemeToContainer, removeThemeFromContainer]);

  // Memoize computed class names
  const themeClasses = useMemo(
    () => ({
      fontClass: FONT_CLASSES[resolvedTheme.fontFamily],
      textSizeClass: TEXT_SIZE_CLASSES[resolvedTheme.fontSize],
      roundedClass: ROUNDED_CLASSES[resolvedTheme.borderRadius],
      spacingClass: SPACING_CLASSES[resolvedTheme.messageSpacing],
    }),
    [resolvedTheme]
  );

  return themeClasses;
}
