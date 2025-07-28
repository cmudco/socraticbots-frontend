import React from 'react';

import { NOTES_SIDEBAR_CONFIG } from '@/constants/notes';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  NotebookPen,
  Plus,
  Search,
} from 'lucide-react';

import { useNoteOperations } from '@/hooks/useNoteOperations';

import { useNotesStore } from '@/stores/core/notesStore';
import { useModalStore } from '@/stores/ui/modalStore';

import NotesCollapsedView from '@/components/chat/NotesCollapsedView';
import NotesContent from '@/components/chat/NotesContent';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { NoteType } from '@/types/note';

interface NotesSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ onCollapseChange }) => {
  const {
    isCollapsed,
    searchTerm,
    isSearching,
    setSearchTerm,
    setIsSearching,
    toggleCollapse,
    openCreateModal,
  } = useNotesStore();

  const { closeDeleteConfirmation } = useModalStore();

  const {
    notes,
    groupedNotes,
    isLoading,
    selectedChapterId,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
    togglePinMutation,
    handleCreateNote,
    handleSaveEdit,
    handleTogglePin,
    handleStartEditing,
    handleOpenDeleteConfirmation,
    handleConfirmDelete,
    deleteConfirmation,
    showCreateModal,
    createNoteType,
    newNoteTitle,
    newNoteContent,
    editingId,
    editTitle,
    editContent,
  } = useNoteOperations();

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
        isCollapsed ? NOTES_SIDEBAR_CONFIG.COLLAPSED_WIDTH : NOTES_SIDEBAR_CONFIG.EXPANDED_WIDTH
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <NotebookPen className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base font-semibold text-slate-800">Notes</h2>
                <p className="text-sm text-slate-600">
                  {!selectedChapterId
                    ? 'Select a bot to view notes'
                    : isLoading
                      ? 'Loading...'
                      : `${notes.length} notes`}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && selectedChapterId && (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-auto px-2 hover:bg-violet-50 hover:text-violet-600"
                    title="Add new note"
                  >
                    <Plus className="h-4 w-4 text-slate-500" />
                    <ChevronDown className="ml-1 h-3 w-3 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openCreateModal(NoteType.INSIGHT)}>
                    <Lightbulb className="mr-2 h-4 w-4 text-amber-600" />
                    <span>Add Insight</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCreateModal(NoteType.QUESTION)}>
                    <HelpCircle className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Add Question</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCreateModal(NoteType.CONCEPT)}>
                    <BookOpen className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>Add Concept</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {!isCollapsed && isSearching && selectedChapterId && (
        <div className="border-b border-slate-200/60 px-4 py-3">
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-9 border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:border-violet-300 focus:ring-violet-200"
          />
        </div>
      )}

      {!isCollapsed && !selectedChapterId && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-800">Select a Bot</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Choose a bot from the dropdown above to start taking notes during your conversation.
            </p>
          </div>
        </div>
      )}

      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      >
        {!isCollapsed && selectedChapterId && (
          <NotesContent
            notes={notes}
            groupedNotes={groupedNotes}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onCreateNote={handleCreateNote}
            onSaveEdit={handleSaveEdit}
            onTogglePin={handleTogglePin}
            onStartEditing={handleStartEditing}
            onOpenDeleteConfirmation={handleOpenDeleteConfirmation}
            createNoteMutation={createNoteMutation}
            updateNoteMutation={updateNoteMutation}
            togglePinMutation={togglePinMutation}
            deleteNoteMutation={deleteNoteMutation}
            showCreateModal={showCreateModal}
            createNoteType={createNoteType}
            newNoteTitle={newNoteTitle}
            newNoteContent={newNoteContent}
            editingId={editingId}
            editTitle={editTitle}
            editContent={editContent}
          />
        )}
      </div>

      {isCollapsed && (
        <NotesCollapsedView
          selectedChapterId={selectedChapterId}
          notesCount={notes.length}
          isLoading={isLoading}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteConfirmation.itemTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteNoteMutation.isPending}
      />
    </div>
  );
};

export default NotesSidebar;
