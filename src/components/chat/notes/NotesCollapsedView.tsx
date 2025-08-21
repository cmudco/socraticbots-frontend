import React from 'react';

import { Plus } from 'lucide-react';

import { useNotesStore } from '@/stores/core/notesStore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NotesCollapsedViewProps {
  selectedBotId: string | null;
  notesCount: number;
  isLoading: boolean;
  onToggleCollapse: () => void;
}

const NotesCollapsedView: React.FC<NotesCollapsedViewProps> = ({
  selectedBotId,
  notesCount,
  isLoading,
  onToggleCollapse,
}) => {
  const { openCreateForm } = useNotesStore();

  const handleAddNoteClick = () => {
    onToggleCollapse();
    openCreateForm();
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-start space-y-4 px-2 pt-8">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
        title="Add note"
        onClick={handleAddNoteClick}
        disabled={!selectedBotId}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="flex flex-col items-center space-y-1">
        <div className="h-px w-6 bg-slate-300"></div>
        <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600">
          {selectedBotId ? (isLoading ? '...' : notesCount) : '0'}
        </Badge>
      </div>
    </div>
  );
};

export default NotesCollapsedView;
