import { BookOpen, HelpCircle, Lightbulb } from 'lucide-react';

import type { NoteTypeConfig } from '@/types/note';
import { NoteType } from '@/types/note';

export const NOTE_TYPE_CONFIGS: Record<NoteType, NoteTypeConfig> = {
  [NoteType.INSIGHT]: {
    icon: Lightbulb,
    color: 'amber',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
    hoverColor: 'hover:bg-amber-100/50',
  },
  [NoteType.QUESTION]: {
    icon: HelpCircle,
    color: 'blue',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:bg-blue-100/50',
  },
  [NoteType.CONCEPT]: {
    icon: BookOpen,
    color: 'emerald',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    hoverColor: 'hover:bg-emerald-100/50',
  },
};

export const DEFAULT_NOTE_TITLES: Record<NoteType, string> = {
  [NoteType.INSIGHT]: 'New Insight',
  [NoteType.QUESTION]: 'New Question',
  [NoteType.CONCEPT]: 'New Concept',
};

export const DEFAULT_NOTE_CONTENT = 'Note content...';

export const NOTES_SIDEBAR_CONFIG = {
  COLLAPSED_WIDTH: 'w-12',
  EXPANDED_WIDTH: 'w-80',
  QUICK_ACTIONS_GRID_COLS: 3,
  QUICK_ACTIONS_GAP: 'gap-1.5',
} as const;
