export interface Note {
  id: string;
  title: string;
  content: string;
  botId: string;    // changed from chapter_id to botId (camelCase)
  createdAt: string; // camelCase from created_at
  updatedAt: string; // camelCase from updated_at
  timestamp?: string;
  userId?: string;
  userName?: string;
  botTitle?: string;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  noteId: string | null;
  noteTitle: string;
}
