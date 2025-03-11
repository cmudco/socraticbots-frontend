// src/services/book.service.ts
import { setupApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  private readonly baseUrl = '/books';
  
  constructor(private apiClient: ReturnType<typeof setupApi>) {}
  
  // Get all books for the current user
  async getBooks(): Promise<Book[]> {
    try {
      const response = await this.apiClient.get<Book[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }
  
  // Get a single book by ID
  async getBook(id: string): Promise<Book> {
    try {
      const response = await this.apiClient.get<Book>(`${this.baseUrl}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new book
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    try {
      const response = await this.apiClient.post<Book>(this.baseUrl + '/', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }
  
  // Update a book
  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    try {
      const response = await this.apiClient.patch<Book>(`${this.baseUrl}/${id}/`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a book
  async deleteBook(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.baseUrl}/${id}/`);
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      throw error;
    }
  }
  
  // Search books (if you implement search in your backend)
  async searchBooks(query: string): Promise<Book[]> {
    try {
      const response = await this.apiClient.get<Book[]>(`${this.baseUrl}/?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching books with query "${query}":`, error);
      throw error;
    }
  }
  
  // Filter books by published status
  async getPublishedBooks(isPublished: boolean = true): Promise<Book[]> {
    try {
      const response = await this.apiClient.get<Book[]>(`${this.baseUrl}/?is_published=${isPublished}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${isPublished ? 'published' : 'unpublished'} books:`, error);
      throw error;
    }
  }
}

// A hook that returns the book service with the authenticated API client
export const useBookService = () => {
  const auth = useAuth();
  const apiClient = setupApi(auth);
  return new BookService(apiClient);
};

