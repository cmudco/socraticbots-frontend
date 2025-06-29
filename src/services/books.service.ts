// src/services/book.service.ts
import { baseRequest } from '../utils/baseRequest';
import { METHOD } from '../constants/requests';
import { Book } from '../types/book';

export interface CreateBookRequest {
  title: string;
  description?: string;
  is_published?: boolean;
}

export interface UpdateBookRequest {
  title?: string;
  description?: string;
  is_published?: boolean;
}

class BookService {
  // Get all books for the current user
  async getBooks(): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
    });
  }

  // Get a single book by ID
  async getBook(id: string): Promise<Book> {
    return baseRequest<Book>({
      url: `books/${id}/`,
      method: METHOD.GET,
    });
  }

  // Create a new book
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    return baseRequest<Book>({
      url: 'books/',
      method: METHOD.POST,
      data: bookData,
    });
  }

  // Update a book
  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    return baseRequest<Book>({
      url: `books/${id}/`,
      method: METHOD.PATCH,
      data: bookData,
    });
  }

  // Delete a book
  async deleteBook(id: string): Promise<void> {
    return baseRequest<void>({
      url: `books/${id}/`,
      method: METHOD.DELETE,
    });
  }

  // Search books (if you implement search in your backend)
  async searchBooks(query: string): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
      params: { search: query },
    });
  }

  // Filter books by published status
  async getPublishedBooks(isPublished: boolean = true): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
      params: { is_published: isPublished },
    });
  }
}

// Export a singleton instance
export const bookService = new BookService();
