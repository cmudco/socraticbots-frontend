import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { CreateBookRequest, UpdateBookRequest, bookService } from '@/services/books.service';

import { Book } from '@/types/book';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters?: string) => [...bookKeys.lists(), { filters }] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
  published: (isPublished: boolean) => [...bookKeys.all, 'published', isPublished] as const,
};

/**
 * Get all books for the current user
 */
export const useBooks = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: bookKeys.lists(),
    queryFn: () => bookService.getBooks(),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Create a new book
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: CreateBookRequest) => bookService.createBook(bookData),
    onSuccess: (newBook: Book) => {
      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks ? [...oldBooks, newBook] : [newBook];
      });

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
      queryClient.setQueryData<Book>(bookKeys.detail(updatedBook.id), updatedBook);

      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks
          ? oldBooks.map(book => (book.id === updatedBook.id ? updatedBook : book))
          : [updatedBook];
      });

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
      queryClient.setQueryData<Book[]>(bookKeys.lists(), oldBooks => {
        return oldBooks ? oldBooks.filter(book => book.id !== deletedId) : [];
      });

      queryClient.removeQueries({ queryKey: bookKeys.detail(deletedId) });

      queryClient.invalidateQueries({ queryKey: bookKeys.search('') });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(true) });
      queryClient.invalidateQueries({ queryKey: bookKeys.published(false) });
    },
    onError: error => {
      console.error('Failed to delete book:', error);
    },
  });
};
