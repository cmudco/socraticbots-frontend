export enum NoteType {
  INSIGHT = 'insight',
  QUESTION = 'question',
  CONCEPT = 'concept',
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  timestamp: string;
  isPinned: boolean;
  user_id?: string;
  user_name?: string;
  chapter_id: string;
  chapter_title?: string;
  book_id?: string;
  book_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NoteTypeConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  hoverColor: string;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  noteId: string | null;
  noteTitle: string;
}
