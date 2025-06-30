// src/hooks/queries/useBooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CreateBookRequest, UpdateBookRequest, bookService } from '../../services/books.service';
import { useAuthStore } from '../../stores/authStore';
import { Book } from '../../types/book';

// Query Keys
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters?: string) => [...bookKeys.lists(), { filters }] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
  published: (isPublished: boolean) => [...bookKeys.all, 'published', isPublished] as const,
};

// Query Hooks

/**
 * Get all books for the current user
 */
export const useBooks = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: bookKeys.lists(),
    queryFn: () => bookService.getBooks(),
    enabled: isAuthenticated && !!tokens?.access, // Only run if authenticated and has valid token
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get a single book by ID
 */
export const useBook = (id: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookService.getBook(id),
    enabled: enabled && !!id && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Search books by query
 */
export const useSearchBooks = (query: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: bookKeys.search(query),
    queryFn: () => bookService.searchBooks(query),
    enabled: enabled && !!query.trim() && isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000, // 2 minutes (search results change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get published/unpublished books
 */
export const usePublishedBooks = (isPublished: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: bookKeys.published(isPublished),
    queryFn: () => bookService.getPublishedBooks(isPublished),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation Hooks

/**
 * Create a new book
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: CreateBookRequest) => bookService.createBook(bookData),
    onSuccess: (newBook: Book) => {
      // Add to cache optimistically
      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks ? [...oldBooks, newBook] : [newBook];
      });

      // Invalidate and refetch all book-related queries
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
    onError: error => {
      console.error('Failed to create book:', error);
    },
  });
};

/**
 * Update an existing book
 */
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookData }: { id: string; bookData: UpdateBookRequest }) =>
      bookService.updateBook(id, bookData),
    onSuccess: (updatedBook: Book) => {
      // Update the specific book in cache
      queryClient.setQueryData<Book>(bookKeys.detail(updatedBook.id), updatedBook);

      // Update book in the list cache
      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks
          ? oldBooks.map(book => (book.id === updatedBook.id ? updatedBook : book))
          : [updatedBook];
      });

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: bookKeys.search('') });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(true) });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(false) });
    },
    onError: error => {
      console.error('Failed to update book:', error);
    },
  });
};

/**
 * Delete a book
 */
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookService.deleteBook(id),
    onSuccess: (_, deletedId: string) => {
      // Remove from list cache
      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks ? oldBooks.filter(book => book.id !== deletedId) : [];
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: bookKeys.detail(deletedId) });

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: bookKeys.search('') });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(true) });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(false) });
    },
    onError: error => {
      console.error('Failed to delete book:', error);
    },
  });
};
