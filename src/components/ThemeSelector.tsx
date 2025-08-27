import { Moon, Palette, Sun } from 'lucide-react';

import { type ThemeName, useThemeStore } from '@/stores/ui/themeStore';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const themes: { name: ThemeName; label: string; description: string }[] = [
  {
    name: 'amber-minimal',
    label: 'Amber Minimal',
    description: 'Clean and minimal with warm amber accents',
  },
  {
    name: 'amethyst-haze',
    label: 'Amethyst Haze',
    description: 'Elegant purple theme with mystical vibes',
  },
  {
    name: 'bold-tech',
    label: 'Bold Tech',
    description: 'Modern tech-focused with bold blue accents',
  },
  {
    name: 'sunset-horizon',
    label: 'Sunset Horizon',
    description: 'Warm sunset-inspired orange and red tones',
  },
  {
    name: 'caffeine',
    label: 'Caffeine',
    description: 'A bold, tech-inspired theme with a caffeine-inspired color palette',
  },
  {
    name: 'ocean-breeze',
    label: 'Ocean Breeze',
    description: 'A refreshing blue and green theme with a coastal vibe',
  },
  {
    name: 'bubblegum',
    label: 'Bubblegum',
    description: 'A soft pink and purple theme with a bubblegum-inspired color palette',
  },
  {
    name: 'twitter',
    label: 'Twitter',
    description: 'A modern, tech-inspired theme with a twitter-inspired color palette',
  },
  {
    name: 't3-chat',
    label: 'T3 Chat',
    description: 'A modern, tech-inspired theme with a chat-inspired color palette',
  },
];

export function ThemeSelector() {
  const { currentTheme, isDarkMode, setTheme, toggleDarkMode } = useThemeStore();

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
  };

  const currentThemeInfo = themes.find(t => t.name === currentTheme);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-foreground bg-background border-border hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors">
          <Palette className="h-4 w-4" />
          <span>{currentThemeInfo?.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[50vh] w-64 overflow-y-auto" align="end">
        <h3 className="text-popover-foreground mb-3 text-sm font-medium">Choose Theme</h3>

        <div className="space-y-2">
          {themes.map(theme => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme.name)}
              className={`w-full rounded-md p-3 text-left transition-colors ${
                currentTheme === theme.name
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className="font-medium">{theme.label}</div>
              <div className="text-xs opacity-80">{theme.description}</div>
            </button>
          ))}
        </div>

        <div className="border-border mt-4 border-t pt-4">
          <button
            onClick={toggleDarkMode}
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md p-3 transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
