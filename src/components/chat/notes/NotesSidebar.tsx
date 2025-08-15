import React from 'react';

import {
  ChevronLeft,
  ChevronRight,
  NotebookPen,
} from 'lucide-react';

import { useNotesStore } from '../../../stores/core/notesStore';
import { useNoteOperations } from '../../../hooks/useNoteOperations';

import NotesCollapsedView from './components/NotesCollapsedView';
import NotesContent from './components/NotesContent';
import { Button } from '../../ui/button';

interface NotesSidebarProps {
  selectedBotId: string | null;
  onCollapseChange?: (collapsed: boolean) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ 
  selectedBotId,
  onCollapseChange 
}) => {
  const { isCollapsed, toggleCollapse } = useNotesStore();
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
      } relative flex h-full flex-shrink-0 flex-col border-l border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 backdrop-blur-sm transition-all duration-300 ease-in-out`}
    >
      <Button
        onClick={handleToggleCollapse}
        variant="ghost"
        size="sm"
        className="absolute top-6 -left-4 z-[100] h-8 w-8 rounded-full border border-slate-200/60 bg-white p-0 shadow-lg transition-all hover:border-violet-300 hover:bg-violet-50 hover:shadow-xl"
        title={isCollapsed ? 'Expand notes' : 'Collapse notes'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        )}
      </Button>

      <div className="border-b border-slate-200/60 px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <NotebookPen className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-base font-semibold text-slate-800">Notes</h2>
              <p className="text-sm text-slate-600">
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
        {!isCollapsed && (
          <NotesContent selectedBotId={selectedBotId} />
        )}
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
