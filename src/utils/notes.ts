import type { Note } from '@/types/note';

export const filterNotes = (notes: Note[], searchTerm: string): Note[] => {
  if (!searchTerm.trim()) return notes;
  const term = searchTerm.toLowerCase();
  return notes.filter(
    note =>
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      note.type.toLowerCase().includes(term)
  );
};

export const groupNotesByPinStatus = (notes: Note[]) => {
  const pinned = notes.filter(note => note.isPinned);
  const unpinned = notes.filter(note => !note.isPinned);
  return { pinned, unpinned };
};

export const capitalizeNoteType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};
