import React from 'react';

import { BookOpen, HelpCircle, Lightbulb } from 'lucide-react';

import { useNotesStore } from '@/stores/core/notesStore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { NoteType } from '@/types/note';

interface NotesCollapsedViewProps {
  selectedChapterId: string | null;
  notesCount: number;
  isLoading: boolean;
  onToggleCollapse: () => void;
}

const NotesCollapsedView: React.FC<NotesCollapsedViewProps> = ({
  selectedChapterId,
  notesCount,
  isLoading,
  onToggleCollapse,
}) => {
  const { openCreateModal } = useNotesStore();

  const handleNoteTypeClick = (noteType: NoteType) => {
    onToggleCollapse();
    openCreateModal(noteType);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-start space-y-4 px-2 pt-8">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-50"
          title="Add insight"
          onClick={() => handleNoteTypeClick(NoteType.INSIGHT)}
          disabled={!selectedChapterId}
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
          title="Add question"
          onClick={() => handleNoteTypeClick(NoteType.QUESTION)}
          disabled={!selectedChapterId}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-50"
          title="Add concept"
          onClick={() => handleNoteTypeClick(NoteType.CONCEPT)}
          disabled={!selectedChapterId}
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-1">
        <div className="h-px w-6 bg-slate-300"></div>
        <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600">
          {selectedChapterId ? (isLoading ? '...' : notesCount) : '0'}
        </Badge>
      </div>
    </div>
  );
};

export default NotesCollapsedView;
