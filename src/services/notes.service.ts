import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { Note, NoteType } from '@/types/note';

export interface CreateNoteRequest {
  title: string;
  content: string;
  type: NoteType;
  isPinned: boolean;
  chapter_id: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  type?: NoteType;
  isPinned?: boolean;
}

class NotesService {
  async getNotes(chapterId?: string): Promise<Note[]> {
    const params = chapterId ? { chapter_id: chapterId } : {};
    return baseRequest<Note[]>({
      url: 'notes/',
      method: METHOD.GET,
      params,
    });
  }

  async getNote(id: string): Promise<Note> {
    return baseRequest<Note>({
      url: `notes/${id}/`,
      method: METHOD.GET,
    });
  }

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    return baseRequest<Note>({
      url: 'notes/',
      method: METHOD.POST,
      data: noteData,
    });
  }

  async updateNote(id: string, noteData: UpdateNoteRequest): Promise<Note> {
    return baseRequest<Note>({
      url: `notes/${id}/`,
      method: METHOD.PATCH,
      data: noteData,
    });
  }

  async deleteNote(id: string): Promise<void> {
    return baseRequest<void>({
      url: `notes/${id}/`,
      method: METHOD.DELETE,
    });
  }

  async searchNotes(query: string, chapterId?: string): Promise<{ results: Note[] }> {
    const params: Record<string, string> = { q: query };
    if (chapterId) {
      params.chapter_id = chapterId;
    }

    return baseRequest<{ results: Note[] }>({
      url: 'notes/search/',
      method: METHOD.GET,
      params,
    });
  }

  async togglePin(id: string): Promise<Note> {
    return baseRequest<Note>({
      url: `notes/${id}/toggle_pin/`,
      method: METHOD.POST,
    });
  }

  async getNotesByType(type: NoteType, chapterId?: string): Promise<Note[]> {
    const params: Record<string, string> = { type };
    if (chapterId) {
      params.chapter_id = chapterId;
    }

    return baseRequest<Note[]>({
      url: 'notes/by_type/',
      method: METHOD.GET,
      params,
    });
  }

  async getPinnedNotes(chapterId?: string): Promise<Note[]> {
    const params = chapterId ? { chapter_id: chapterId } : {};
    return baseRequest<Note[]>({
      url: 'notes/pinned/',
      method: METHOD.GET,
      params,
    });
  }

  async getNotesByChapter(chapterId: string): Promise<Note[]> {
    return baseRequest<Note[]>({
      url: 'notes/by_chapter/',
      method: METHOD.GET,
      params: { chapter_id: chapterId },
    });
  }
}

export const notesService = new NotesService();
