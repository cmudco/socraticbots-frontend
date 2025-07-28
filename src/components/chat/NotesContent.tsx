import React from 'react';

import { NOTES_SIDEBAR_CONFIG, NOTE_TYPE_CONFIGS } from '@/constants/notes';
import { Edit3, NotebookPen, Pin, PinOff, X } from 'lucide-react';

import { useNotesStore } from '@/stores/core/notesStore';

import { capitalizeNoteType } from '@/utils/notes';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { Note } from '@/types/note';
import { NoteType } from '@/types/note';

interface NotesContentProps {
  notes: Note[];
  groupedNotes: { pinned: Note[]; unpinned: Note[] };
  isLoading: boolean;
  searchTerm: string;
  onCreateNote: () => void;
  onSaveEdit: () => void;
  onTogglePin: (id: string) => void;
  onStartEditing: (note: Note) => void;
  onOpenDeleteConfirmation: (note: Note) => void;
  createNoteMutation: { isPending: boolean };
  updateNoteMutation: { isPending: boolean };
  togglePinMutation: { isPending: boolean };
  deleteNoteMutation: { isPending: boolean };
  showCreateModal: boolean;
  createNoteType: NoteType;
  newNoteTitle: string;
  newNoteContent: string;
  editingId: string | null;
  editTitle: string;
  editContent: string;
}

const NotesContent: React.FC<NotesContentProps> = ({
  groupedNotes,
  isLoading,
  searchTerm,
  onCreateNote,
  onSaveEdit,
  onTogglePin,
  onStartEditing,
  onOpenDeleteConfirmation,
  createNoteMutation,
  updateNoteMutation,
  togglePinMutation,
  deleteNoteMutation,
  showCreateModal,
  createNoteType,
  newNoteTitle,
  newNoteContent,
  editingId,
  editTitle,
  editContent,
}) => {
  const {
    closeCreateModal,
    openCreateModal,
    setNewNoteTitle,
    setNewNoteContent,
    setEditTitle,
    setEditContent,
    cancelEdit,
  } = useNotesStore();

  const renderNoteItem = (note: Note) => {
    const config = NOTE_TYPE_CONFIGS[note.type];
    const isEditing = editingId === note.id;

    return (
      <div
        key={note.id}
        className={`group rounded-xl border bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${config.borderColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <config.icon className={`h-3 w-3 ${config.iconColor}`} />
              <Badge
                variant="secondary"
                className={`text-xs ${config.bgColor} ${config.textColor}`}
              >
                {note.type}
              </Badge>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Note title..."
                />
                <Textarea
                  value={editContent}
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
                    onClick={onSaveEdit}
                    disabled={updateNoteMutation.isPending}
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer space-y-1" onClick={() => onStartEditing(note)}>
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
                onClick={() => onStartEditing(note)}
                title="Edit note"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => onTogglePin(note.id)}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
                disabled={togglePinMutation.isPending}
              >
                {note.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                onClick={() => onOpenDeleteConfirmation(note)}
                title="Delete note"
                disabled={deleteNoteMutation.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInlineCreator = () => {
    if (!showCreateModal) return null;

    const config = NOTE_TYPE_CONFIGS[createNoteType];

    return (
      <div
        className={`rounded-xl border bg-white/90 p-3 shadow-sm backdrop-blur-sm ${config.borderColor}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <config.icon className={`h-3 w-3 ${config.iconColor}`} />
              <Badge
                variant="secondary"
                className={`text-xs ${config.bgColor} ${config.textColor}`}
              >
                {createNoteType}
              </Badge>
              <span className="text-sm font-medium text-slate-700">
                New {capitalizeNoteType(createNoteType)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-100"
              onClick={closeCreateModal}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder={`${capitalizeNoteType(createNoteType)} title...`}
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              className="h-8 border-slate-200 text-sm focus:border-violet-300 focus:ring-violet-200"
            />
            <Textarea
              placeholder="Write your note content..."
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              rows={3}
              className="min-h-[60px] resize-none border-slate-200 text-sm focus:border-violet-300 focus:ring-violet-200"
            />
          </div>

          <div className="flex justify-end space-x-1">
            <Button variant="outline" size="sm" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button
              onClick={onCreateNote}
              disabled={createNoteMutation.isPending}
              size="sm"
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickActions = () => {
    const noteTypes = Object.values(NoteType);

    return (
      <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
        <h3 className="mb-2 text-xs font-semibold text-slate-800">Quick Actions</h3>
        <div
          className={`grid grid-cols-${NOTES_SIDEBAR_CONFIG.QUICK_ACTIONS_GRID_COLS} ${NOTES_SIDEBAR_CONFIG.QUICK_ACTIONS_GAP}`}
        >
          {noteTypes.map(noteType => {
            const config = NOTE_TYPE_CONFIGS[noteType];
            return (
              <Button
                key={noteType}
                variant="outline"
                size="sm"
                className={`h-auto flex-col space-y-1 border-dashed p-2 ${config.borderColor} ${config.bgColor} ${config.hoverColor}`}
                onClick={() => {
                  openCreateModal(noteType);
                }}
              >
                <config.icon className={`h-3 w-3 ${config.iconColor}`} />
                <span className={`text-xs ${config.textColor}`}>
                  {noteType.charAt(0).toUpperCase() + noteType.slice(1)}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-4">
        <div className="space-y-4">
          {renderQuickActions()}

          <div className="space-y-3">
            {renderInlineCreator()}

            {groupedNotes.pinned.length === 0 &&
            groupedNotes.unpinned.length === 0 &&
            !isLoading ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <NotebookPen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  {searchTerm
                    ? 'No notes match your search.'
                    : 'No notes yet. Create your first note!'}
                </p>
              </div>
            ) : (
              <>
                {groupedNotes.pinned.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center space-x-2">
                      <Pin className="h-3 w-3 text-slate-400" />
                      <h4 className="text-xs font-medium text-slate-600">Pinned</h4>
                    </div>
                    <div className="space-y-2">{groupedNotes.pinned.map(renderNoteItem)}</div>
                  </div>
                )}

                {groupedNotes.unpinned.length > 0 && (
                  <div>
                    {groupedNotes.pinned.length > 0 && (
                      <div className="mb-2 flex items-center space-x-2">
                        <h4 className="text-xs font-medium text-slate-600">Notes</h4>
                      </div>
                    )}
                    <div className="space-y-2">{groupedNotes.unpinned.map(renderNoteItem)}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesContent;
