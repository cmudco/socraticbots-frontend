import React from 'react';

import { ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react';

import { useNoteOperations } from '@/hooks/useNoteOperations';

import { useConversationStore } from '@/stores/core/conversationStore';
import { useNotesStore } from '@/stores/core/notesStore';

import { Button } from '@/components/ui/button';

import NotesCollapsedView from './NotesCollapsedView';
import NotesContent from './NotesContent';

interface NotesSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ onCollapseChange }) => {
  const { isCollapsed, toggleCollapse } = useNotesStore();
  const { currentBotId } = useConversationStore();

  // Convert number to string for notes operations
  const selectedBotId = currentBotId ? String(currentBotId) : null;
  const { notes, isLoading } = useNoteOperations(selectedBotId);

  const handleToggleCollapse = () => {
    toggleCollapse();
    onCollapseChange?.(!isCollapsed);
  };

  React.useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  return (
    <div
      className={`${
        isCollapsed ? 'w-12' : 'w-80'
      } border-border/60 from-muted/30 via-background to-primary/5 relative flex h-full flex-shrink-0 flex-col border-l bg-gradient-to-br backdrop-blur-sm transition-all duration-300 ease-in-out`}
    >
      <Button
        onClick={handleToggleCollapse}
        variant="ghost"
        size="sm"
        className="border-border/60 bg-background hover:border-primary hover:bg-primary/5 absolute top-6 -left-4 z-[100] h-8 w-8 rounded-full border p-0 shadow-lg transition-all hover:shadow-xl"
        title={isCollapsed ? 'Expand notes' : 'Collapse notes'}
      >
        {isCollapsed ? (
          <ChevronLeft className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        )}
      </Button>

      <div className="border-border/60 border-b px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="from-primary to-primary/80 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
            <NotebookPen className="text-primary-foreground h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-foreground text-base font-semibold">Notes</h2>
              <p className="text-muted-foreground text-sm">
                {!selectedBotId
                  ? 'Select a bot to view notes'
                  : isLoading
                    ? 'Loading...'
                    : `${notes?.length || 0} notes`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      >
        {!isCollapsed && <NotesContent selectedBotId={selectedBotId} />}
      </div>

      {isCollapsed && (
        <NotesCollapsedView
          selectedBotId={selectedBotId}
          notesCount={notes?.length || 0}
          isLoading={isLoading}
          onToggleCollapse={handleToggleCollapse}
        />
      )}
    </div>
  );
};

export default NotesSidebar;
