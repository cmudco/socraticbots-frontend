import React from 'react';

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  HelpCircle,
  Lightbulb,
  NotebookPen,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Star,
  X,
} from 'lucide-react';

import { useNotesStore } from '@/stores/core/notesStore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NotesSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ onCollapseChange }) => {
  // Use Zustand for all notes state management
  const {
    notes,
    isCollapsed,
    searchTerm,
    isSearching,
    editingId,
    showCreateModal,
    createNoteType,
    newNoteTitle,
    newNoteContent,
    editTitle,
    editContent,
    toggleCollapse,
    setSearchTerm,
    setIsSearching,
    createNote,
    startEditing,
    saveEdit,
    cancelEdit,
    togglePin,
    deleteNote,
    openCreateModal,
    closeCreateModal,
    setNewNoteTitle,
    setNewNoteContent,
    setEditTitle,
    setEditContent,
    getFilteredNotes,
  } = useNotesStore();

  const handleToggleCollapse = () => {
    toggleCollapse();
    onCollapseChange?.(isCollapsed);
  };

  const filteredNotes = getFilteredNotes();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Lightbulb className="h-3 w-3" />;
      case 'question':
        return <HelpCircle className="h-3 w-3" />;
      case 'concept':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <NotebookPen className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'question':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'concept':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-12' : 'w-80'
      } relative flex h-full flex-shrink-0 flex-col border-l border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 backdrop-blur-sm transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button - Fixed z-index issue */}
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

      {/* Enhanced Header */}
      <div className="border-b border-slate-200/60 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <NotebookPen className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base font-semibold text-slate-800">Smart Notes</h2>
                <p className="text-sm text-slate-600">AI-enhanced learning</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-slate-100 hover:text-slate-600"
                title="Search notes"
                onClick={() => setIsSearching(!isSearching)}
              >
                <Search className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-violet-50 hover:text-violet-600"
                title="Add new note"
                onClick={() => openCreateModal('insight')}
              >
                <Plus className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && isSearching && (
        <div className="border-b border-slate-200/60 px-4 py-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white/50 py-2 pr-4 pl-10 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3 text-slate-400" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {!isCollapsed && showCreateModal && (
        <div className="border-b border-slate-200/60 bg-white/95 px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={`h-6 px-2 text-xs ${getTypeColor(createNoteType)}`}
                >
                  {getTypeIcon(createNoteType)}
                  <span className="ml-1 capitalize">{createNoteType}</span>
                </Badge>
                <span className="text-sm font-medium text-slate-700">New Note</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={closeCreateModal}>
                <X className="h-3 w-3 text-slate-400" />
              </Button>
            </div>

            <input
              type="text"
              placeholder="Note title..."
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none"
            />

            <textarea
              placeholder="Write your note here..."
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none"
            />

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeCreateModal}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={createNote}
                className="h-8 bg-violet-600 px-3 text-xs hover:bg-violet-700"
                disabled={!newNoteTitle.trim() && !newNoteContent.trim()}
              >
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Content */}
      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      >
        {!isCollapsed && (
          <div className="h-full overflow-y-auto">
            <div className="px-4 py-4">
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto flex-col space-y-1 border-dashed border-amber-300 bg-amber-50/50 p-3 hover:bg-amber-100/50"
                      onClick={() => openCreateModal('insight')}
                    >
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-700">Insight</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto flex-col space-y-1 border-dashed border-blue-300 bg-blue-50/50 p-3 hover:bg-blue-100/50"
                      onClick={() => openCreateModal('question')}
                    >
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700">Question</span>
                    </Button>
                  </div>
                </div>

                {/* Recent Notes Section */}
                <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
                  <div className="border-b border-slate-200/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {searchTerm ? 'Search Results' : 'Recent Notes'}
                      </h3>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        {filteredNotes.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map(note => (
                        <div
                          key={note.id}
                          className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-all hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm"
                        >
                          {editingId === note.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className={`h-6 px-2 text-xs ${getTypeColor(note.type)}`}
                                >
                                  {getTypeIcon(note.type)}
                                  <span className="ml-1 capitalize">{note.type}</span>
                                </Badge>
                                <span className="text-xs text-slate-500">Editing...</span>
                              </div>

                              <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                                placeholder="Note title..."
                              />

                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={4}
                                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                                placeholder="Note content..."
                              />

                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEdit}
                                  className="h-6 px-2 text-xs"
                                >
                                  <RotateCcw className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={saveEdit}
                                  className="h-6 bg-violet-600 px-2 text-xs hover:bg-violet-700"
                                >
                                  <Save className="mr-1 h-3 w-3" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <>
                              <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="secondary"
                                    className={`h-6 px-2 text-xs ${getTypeColor(note.type)}`}
                                  >
                                    {getTypeIcon(note.type)}
                                    <span className="ml-1 capitalize">{note.type}</span>
                                  </Badge>
                                  {note.isPinned && <Pin className="h-3 w-3 text-violet-500" />}
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => togglePin(note.id)}
                                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                                  >
                                    <Pin
                                      className={`h-3 w-3 ${note.isPinned ? 'text-violet-500' : 'text-slate-400'}`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => startEditing(note)}
                                    title="Edit note"
                                  >
                                    <Edit3 className="h-3 w-3 text-slate-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => deleteNote(note.id)}
                                    title="Delete note"
                                  >
                                    <X className="h-3 w-3 text-slate-400" />
                                  </Button>
                                </div>
                              </div>

                              <h4
                                className="mb-2 line-clamp-2 cursor-pointer text-sm font-medium text-slate-800"
                                onClick={() => startEditing(note)}
                              >
                                {note.title}
                              </h4>
                              <p
                                className="mb-3 line-clamp-4 cursor-pointer text-xs leading-relaxed text-slate-600"
                                onClick={() => startEditing(note)}
                              >
                                {note.content}
                              </p>

                              <div className="flex items-center justify-end">
                                <div className="flex items-center space-x-1 text-xs text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{note.timestamp}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Search className="h-6 w-6 text-slate-400" />
                        </div>
                        <h4 className="mb-2 text-sm font-medium text-slate-700">
                          {searchTerm ? 'No matching notes' : 'No notes yet'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchTerm
                            ? 'Try different search terms'
                            : 'Create your first note using the buttons above'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study Tips */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
                  <div className="mb-3 flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-800">Study Tip</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-700">
                    Try the Cornell Note-taking method: divide your notes into cues, notes, and
                    summary sections for better retention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Improved Collapsed state content */}
      {isCollapsed && (
        <div className="flex flex-1 flex-col items-center justify-start space-y-4 px-2 pt-8">
          {/* Quick add buttons */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-50"
              title="Add insight"
              onClick={() => openCreateModal('insight')}
            >
              <Lightbulb className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
              title="Add question"
              onClick={() => openCreateModal('question')}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-50"
              title="Add concept"
              onClick={() => openCreateModal('concept')}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>

          {/* Notes count */}
          <div className="flex flex-col items-center space-y-1">
            <div className="h-px w-6 bg-slate-300"></div>
            <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600">
              {notes.length}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSidebar;
