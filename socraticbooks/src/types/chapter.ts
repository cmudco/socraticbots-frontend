export interface Chapter {
    id: string;
    title: string;
    subject?: string;
    topic?: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    restrictions?: string;
    book_id: string;
    user_id: string;
    learning_goals?: string[];
    created_at: string;
    updated_at: string;
  }
  
  export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }