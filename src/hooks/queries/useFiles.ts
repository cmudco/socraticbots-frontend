import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fileService } from '../../services/files.service';
import { useAuthStore } from '../../stores/authStore';
import {
  ChapterFile,
  FileFilters,
  FileProcessingStatus,
  UploadFileRequest,
} from '../../types/file';

// Query Keys
export const fileKeys = {
  all: ['files'] as const,
  chapters: () => [...fileKeys.all, 'chapter'] as const,
  chapter: (chapterId: string) => [...fileKeys.chapters(), chapterId] as const,
  chapterFiles: (chapterId: string, filters?: FileFilters) =>
    [...fileKeys.chapter(chapterId), 'list', { filters }] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (chapterId: string, fileId: string) =>
    [...fileKeys.details(), chapterId, fileId] as const,
  search: (query: string) => [...fileKeys.all, 'search', query] as const,
  status: (chapterId: string, status: ChapterFile['processing_status']) =>
    [...fileKeys.chapter(chapterId), 'status', status] as const,
};

// Query Hooks

/**
 * Get all files for a specific chapter
 */
export const useChapterFiles = (
  chapterId: string,
  filters?: FileFilters,
  enabled: boolean = true
) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: fileKeys.chapterFiles(chapterId, filters),
    queryFn: () => fileService.getChapterFiles(chapterId, filters),
    enabled: enabled && !!chapterId && isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a single file by ID
 */
export const useFile = (chapterId: string, fileId: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: fileKeys.detail(chapterId, fileId),
    queryFn: () => fileService.getFile(chapterId, fileId),
    enabled: enabled && !!chapterId && !!fileId && isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Search files across all chapters
 */
export const useSearchFiles = (query: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: fileKeys.search(query),
    queryFn: () => fileService.searchFiles(query),
    enabled: enabled && !!query.trim() && isAuthenticated && !!tokens?.access,
    staleTime: 1 * 60 * 1000, // 1 minute (search results change more frequently)
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Get files by processing status
 */
export const useFilesByStatus = (chapterId: string, status: ChapterFile['processing_status']) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: fileKeys.status(chapterId, status),
    queryFn: () => fileService.getFilesByStatus(chapterId, status),
    enabled: !!chapterId && isAuthenticated && !!tokens?.access,
    staleTime: 30 * 1000, // 30 seconds (processing status changes frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation Hooks

/**
 * Upload a file to a chapter
 */
export const useUploadFile = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uploadData,
    }: {
      uploadData: UploadFileRequest;
      onProgress?: (progress: number) => void;
    }) => fileService.uploadChapterFile(chapterId, uploadData),
    onSuccess: (newFile: ChapterFile) => {
      // Add to cache optimistically
      queryClient.setQueryData<ChapterFile[]>(fileKeys.chapterFiles(chapterId), oldFiles => {
        return oldFiles ? [...oldFiles, newFile] : [newFile];
      });

      // Invalidate and refetch all file-related queries for this chapter
      queryClient.invalidateQueries({ queryKey: fileKeys.chapter(chapterId) });
      queryClient.invalidateQueries({ queryKey: fileKeys.search('') });
    },
    onError: error => {
      console.error('Failed to upload file:', error);
    },
  });
};

/**
 * Update file metadata
 */
export const useUpdateFile = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      updateData,
    }: {
      fileId: string;
      updateData: Partial<Pick<ChapterFile, 'name'>>;
    }) => fileService.updateFile(chapterId, fileId, updateData),
    onSuccess: (updatedFile: ChapterFile) => {
      // Update the specific file in cache
      queryClient.setQueryData<ChapterFile>(
        fileKeys.detail(chapterId, updatedFile.id),
        updatedFile
      );

      // Update file in the list cache
      queryClient.setQueryData<ChapterFile[]>(fileKeys.chapterFiles(chapterId), oldFiles => {
        return oldFiles
          ? oldFiles.map(file => (file.id === updatedFile.id ? updatedFile : file))
          : [updatedFile];
      });

      // Invalidate search results
      queryClient.invalidateQueries({ queryKey: fileKeys.search('') });
    },
    onError: error => {
      console.error('Failed to update file:', error);
    },
  });
};

/**
 * Delete a file
 */
export const useDeleteFile = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(chapterId, fileId),
    onSuccess: (_, deletedFileId: string) => {
      // Remove from list cache
      queryClient.setQueryData<ChapterFile[]>(fileKeys.chapterFiles(chapterId), oldFiles => {
        return oldFiles ? oldFiles.filter(file => file.id !== deletedFileId) : [];
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: fileKeys.detail(chapterId, deletedFileId) });

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: fileKeys.search('') });
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.COMPLETED),
      });
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.FAILED),
      });
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.PROCESSING),
      });
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.PENDING),
      });
    },
    onError: error => {
      console.error('Failed to delete file:', error);
    },
  });
};

/**
 * Reprocess a file
 */
export const useReprocessFile = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.reprocessFile(chapterId, fileId),
    onSuccess: (reprocessedFile: ChapterFile) => {
      // Update the specific file in cache
      queryClient.setQueryData<ChapterFile>(
        fileKeys.detail(chapterId, reprocessedFile.id),
        reprocessedFile
      );

      // Update file in the list cache
      queryClient.setQueryData<ChapterFile[]>(fileKeys.chapterFiles(chapterId), oldFiles => {
        return oldFiles
          ? oldFiles.map(file => (file.id === reprocessedFile.id ? reprocessedFile : file))
          : [reprocessedFile];
      });

      // Invalidate status-based queries
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.PROCESSING),
      });
      queryClient.invalidateQueries({
        queryKey: fileKeys.status(chapterId, FileProcessingStatus.FAILED),
      });
    },
    onError: error => {
      console.error('Failed to reprocess file:', error);
    },
  });
};
