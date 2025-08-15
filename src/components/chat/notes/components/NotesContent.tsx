import React from 'react';

import { Edit3, NotebookPen, Plus, X } from 'lucide-react';

import { useNotesStore } from '../../../../stores/core/notesStore';
import { useNoteOperations } from '../../../../hooks/useNoteOperations';

import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import ConfirmationModal from '../../../ui/confirmation-modal';

import type { Note } from '../../../../types/note';

interface NotesContentProps {
  selectedBotId: string | null;
}

const NotesContent: React.FC<NotesContentProps> = ({ selectedBotId }) => {
  // Get notes data and operations
  const {
    notes,
    isLoading,
    handleCreateNote: createNote,
    handleUpdateNote: updateNote,
    handleDeleteNote: deleteNote,
    isCreating,
    isUpdating,
  } = useNoteOperations(selectedBotId);

  // Get UI state from Zustand
  const {
    isCreating: showCreateForm,
    createForm,
    editingData,
    deleteConfirmation,
    openCreateForm,
    closeCreateForm,
    setCreateTitle,
    setCreateContent,
    startEditing,
    cancelEdit,
    setEditTitle,
    setEditContent,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  } = useNotesStore();

  const handleCreateNote = async () => {
    if (createForm.title.trim() && createForm.content.trim()) {
      await createNote(createForm.title, createForm.content);
      closeCreateForm();
    }
  };

  const handleUpdateNote = async () => {
    if (editingData && editingData.title.trim() && editingData.content.trim()) {
      await updateNote(editingData.noteId, editingData.title, editingData.content);
      cancelEdit();
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.noteId) {
      await deleteNote(deleteConfirmation.noteId);
      closeDeleteConfirmation();
    }
  };

  const renderNoteItem = (note: Note) => {
    const isEditing = editingData?.noteId === note.id;

    return (
      <div
        key={note.id}
        className="group rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editingData.title}
                  onChange={e => setEditTitle(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Note title..."
                />
                <Textarea
                  value={editingData.content}
                  onChange={e => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                  placeholder="Note content..."
                />
                <div className="flex justify-end space-x-1">
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateNote}
                    disabled={isUpdating}
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer space-y-1" onClick={() => startEditing(note.id, { title: note.title, content: note.content })}>
                <h5 className="text-sm font-medium text-slate-800">{note.title}</h5>
                <p className="line-clamp-2 text-xs text-slate-600">{note.content}</p>
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => startEditing(note.id, { title: note.title, content: note.content })}
                title="Edit note"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={() => openDeleteConfirmation(note.id, note.title)}
                title="Delete note"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreateForm = () => {
    if (!showCreateForm) return null;

    return (
      <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">New Note</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-100"
              onClick={closeCreateForm}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Note title..."
              value={createForm.title}
              onChange={e => setCreateTitle(e.target.value)}
              className="h-8 border-slate-200 text-sm focus:border-violet-300 focus:ring-violet-200"
            />
            <Textarea
              placeholder="Write your note content..."
              value={createForm.content}
              onChange={e => setCreateContent(e.target.value)}
              rows={3}
              className="min-h-[60px] resize-none border-slate-200 text-sm focus:border-violet-300 focus:ring-violet-200"
            />
          </div>

          <div className="flex justify-end space-x-1">
            <Button variant="outline" size="sm" onClick={closeCreateForm}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={isCreating || !createForm.title.trim() || !createForm.content.trim()}
              size="sm"
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {isCreating ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-4">
        <div className="space-y-4">
          {/* Add Note Button */}
          {!showCreateForm && selectedBotId && (
            <Button
              onClick={openCreateForm}
              className="w-full bg-violet-600 text-white hover:bg-violet-700"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          )}

          <div className="space-y-3">
            {renderCreateForm()}

            {(!notes || notes.length === 0) && !isLoading ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <NotebookPen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  {selectedBotId ? 'No notes yet. Create your first note!' : 'Select a bot to view notes.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes?.map(renderNoteItem)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteConfirmation.noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isUpdating}
      />
    </div>
  );
};

export default NotesContent;
