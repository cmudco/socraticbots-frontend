import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { Note } from '@/types/note';

export interface CreateNoteRequest {
  title: string;
  content: string;
  botId: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

class NotesService {
  async getNotes(botId?: string): Promise<Note[]> {
    const params = botId ? { botId } : {};
    return baseRequest<Note[]>({
      url: 'notes/',
      method: METHOD.GET,
      params,
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
}

export const notesService = new NotesService();
