// src/types/book.ts
export interface Book {
    id: string;
    title: string;
    description: string;
    user_id: string;
  }
  
  export interface BooksState {
    books: Book[];
    loading: boolean;
    error: string | null;
  }