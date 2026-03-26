import React from 'react';

import { Check } from 'lucide-react';

import { type ThemeName, useThemeStore } from '@/stores/ui/themeStore';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
    description: 'Bold, energetic palette with caffeine vibes',
  },
  {
    name: 'ocean-breeze',
    label: 'Ocean Breeze',
    description: 'Refreshing blues and greens with coastal feel',
  },
  {
    name: 'bubblegum',
    label: 'Bubblegum',
    description: 'Soft pinks and purples with playful tone',
  },
  { name: 'twitter', label: 'Twitter', description: 'Modern, clean theme inspired by Twitter' },
  { name: 't3-chat', label: 'T3 Chat', description: 'Tech-inspired chat UI aesthetic' },
];

const AppearanceSettings: React.FC = () => {
  const { currentTheme, isDarkMode, setTheme, setDarkMode } = useThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="text-muted-foreground mt-1 text-sm">Choose your theme and color mode.</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-6">
          <Label htmlFor="darkMode" className="mb-2 block text-sm font-medium">
            Color Mode
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              id="darkMode"
              checked={isDarkMode}
              onCheckedChange={checked => setDarkMode(Boolean(checked))}
            />
            <span className="text-sm">{isDarkMode ? 'Dark' : 'Light'} Mode</span>
          </div>
        </div>

        <div className="mb-3 text-sm font-medium">Theme</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map(theme => {
            const selected = currentTheme === theme.name;
            return (
              <button
                key={theme.name}
                onClick={() => setTheme(theme.name)}
                className={`group flex w-full items-start justify-between rounded-xl border p-4 text-left transition-all hover:shadow ${
                  selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{theme.label}</div>
                  <div className="text-muted-foreground mt-1 text-xs">{theme.description}</div>
                </div>
                <div
                  className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}
                  aria-hidden
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
