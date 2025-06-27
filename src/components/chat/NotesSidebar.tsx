import React, { useState } from 'react';
import { NotebookPen, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className={`${isCollapsed ? 'w-12' : 'w-72'
      } h-full flex flex-col border-l border-slate-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out relative flex-shrink-0`}>

      {/* Toggle Button */}
      <Button
        onClick={toggleCollapse}
        variant="ghost"
        size="sm"
        className="absolute -left-4 top-6 h-8 w-8 p-0 bg-white shadow-lg border border-slate-200/60 hover:border-violet-300 rounded-full z-50 hover:shadow-xl transition-all hover:bg-violet-50"
        title={isCollapsed ? "Expand notes" : "Collapse notes"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        )}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <NotebookPen className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <h3 className="font-semibold text-slate-800 transition-opacity duration-200">Notes</h3>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        {!isCollapsed && (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <div className="space-y-4">
                {/* Empty state */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <NotebookPen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    No notes yet
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Take notes while chatting to keep track of important insights and key learnings.
                  </p>
                </div>

                {/* Add note button */}
                <Button
                  variant="outline"
                  className="w-full text-sm border-dashed border-slate-300 hover:border-violet-300 hover:bg-violet-50/50 text-slate-600 hover:text-violet-600"
                >
                  <NotebookPen className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed state content */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-slate-400 hover:text-violet-500 hover:bg-violet-50"
            title="Add note"
          >
            <NotebookPen className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 transition-opacity duration-200">
          <div className="text-xs text-slate-500 text-center">
            Notes are saved automatically
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSidebar;
