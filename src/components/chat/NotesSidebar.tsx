import React, { useState } from 'react';

import { ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface NotesSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-12' : 'w-72'
      } relative flex h-full flex-shrink-0 flex-col border-l border-slate-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button */}
      <Button
        onClick={toggleCollapse}
        variant="ghost"
        size="sm"
        className="absolute top-6 -left-4 z-50 h-8 w-8 rounded-full border border-slate-200/60 bg-white p-0 shadow-lg transition-all hover:border-violet-300 hover:bg-violet-50 hover:shadow-xl"
        title={isCollapsed ? 'Expand notes' : 'Collapse notes'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        )}
      </Button>

      {/* Header */}
      <div className="border-b border-slate-200/60 p-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-purple-500">
            <NotebookPen className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <h3 className="font-semibold text-slate-800 transition-opacity duration-200">Notes</h3>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      >
        {!isCollapsed && (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <div className="space-y-4">
                {/* Empty state */}
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <NotebookPen className="h-8 w-8 text-slate-400" />
                  </div>
                  <h4 className="mb-2 text-sm font-medium text-slate-700">No notes yet</h4>
                  <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-500">
                    Take notes while chatting to keep track of important insights and key learnings.
                  </p>
                </div>

                {/* Add note button */}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-slate-300 text-sm text-slate-600 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600"
                >
                  <NotebookPen className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed state content */}
      {isCollapsed && (
        <div className="flex flex-1 flex-col items-center justify-center p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:bg-violet-50 hover:text-violet-500"
            title="Add note"
          >
            <NotebookPen className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-slate-200/60 bg-slate-50/50 p-4 transition-opacity duration-200">
          <div className="text-center text-xs text-slate-500">Notes are saved automatically</div>
        </div>
      )}
    </div>
  );
};

export default NotesSidebar;
