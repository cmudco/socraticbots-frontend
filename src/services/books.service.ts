import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { Book } from '@/types/book';

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
  async getBooks(): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
    });
  }

  async getBook(id: string): Promise<Book> {
    return baseRequest<Book>({
      url: `books/${id}/`,
      method: METHOD.GET,
    });
  }

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    return baseRequest<Book>({
      url: 'books/',
      method: METHOD.POST,
      data: bookData,
    });
  }

  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    return baseRequest<Book>({
      url: `books/${id}/`,
      method: METHOD.PATCH,
      data: bookData,
    });
  }

  async deleteBook(id: string): Promise<void> {
    return baseRequest<void>({
      url: `books/${id}/`,
      method: METHOD.DELETE,
    });
  }

  async searchBooks(query: string): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
      params: { search: query },
    });
  }

  async getPublishedBooks(isPublished: boolean = true): Promise<Book[]> {
    return baseRequest<Book[]>({
      url: 'books/',
      method: METHOD.GET,
      params: { is_published: isPublished },
    });
  }
}

export const bookService = new BookService();
