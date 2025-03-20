// src/store/thunks/fileThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '../../services/files.service';
import { 
  setFiles, 
  addFile, 
  removeFile,
  setUploadProgress,
  clearUploadProgress,
  setFileProcessing,
  clearFileProcessing,
  setFileError,
  clearFileError
} from '../slices/chapterFormSlice';

// Fetch all files for a chapter
export const fetchChapterFiles = createAsyncThunk(
  'files/fetchAll',
  async (
    { chapterPublicId }: { chapterPublicId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const files = await fileService.getChapterFiles(chapterPublicId);
      dispatch(setFiles(files));
      return files;
    } catch (error: any) {
      console.error('Error fetching files:', error);
      return rejectWithValue(error.message || 'Failed to fetch files');
    }
  }
);

// Upload a single file
export const uploadChapterFile = createAsyncThunk(
  'files/upload',
  async (
    { 
      chapterPublicId, 
      file 
    }: { 
      chapterPublicId: string, 
      file: File 
    }, 
    { dispatch }
  ) => {
    try {
      // Create temporary ID for tracking progress
      const tempId = `temp-${Date.now()}`;
      
      // Clear any existing errors for this temp ID
      dispatch(clearFileError(tempId));
      
      // Start upload with progress tracking
      const uploadedFile = await fileService.uploadChapterFile(
        chapterPublicId, 
        file,
        (progress) => {
          dispatch(setUploadProgress({ fileId: tempId, progress }));
        }
      );

      // Clear progress tracking
      dispatch(clearUploadProgress(tempId));
      
      // If file needs processing (PDF, DOC, etc.), set processing status
      if (uploadedFile.processing_status === 'processing') {
        dispatch(setFileProcessing(uploadedFile.id));
      }

      // Add file to state
      dispatch(addFile(uploadedFile));

      return uploadedFile;
    } catch (error: any) {
      // Handle error
      console.error('File upload failed:', error);
      dispatch(setFileError({ 
        fileId: `temp-${Date.now()}`, 
        error: error.message || 'Upload failed' 
      }));
      throw error;
    }
  }
);

// Upload multiple files
export const uploadMultipleFiles = createAsyncThunk(
  'files/uploadMultiple',
  async (
    { 
      chapterPublicId, 
      files 
    }: { 
      chapterPublicId: string, 
      files: File[] 
    }, 
    { dispatch }
  ) => {
    const uploadPromises = files.map(file => 
      dispatch(uploadChapterFile({ chapterPublicId, file }))
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Some files failed to upload:', error);
      throw error;
    }
  }
);

// Delete a file
export const deleteChapterFile = createAsyncThunk(
  'files/delete',
  async (
    { fileId }: { fileId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await fileService.deleteFile(fileId);
      dispatch(removeFile(fileId));
      return fileId;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      return rejectWithValue(error.message || 'Failed to delete file');
    }
  }
);

// Poll for file processing status
export const pollFileProcessing = createAsyncThunk(
  'files/pollProcessing',
  async (
    { 
      chapterPublicId,
      fileId 
    }: { 
      chapterPublicId: string,
      fileId: string 
    }, 
    { dispatch, getState }
  ) => {
    const maxAttempts = 10;
    const interval = 2000; // 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Fetch latest files
      const files = await fileService.getChapterFiles(chapterPublicId);
      const processingFile = files.find(f => f.id === fileId);
      
      if (!processingFile) {
        throw new Error('File not found');
      }

      if (processingFile.processing_status === 'completed') {
        dispatch(clearFileProcessing(fileId));
        // Update the file in state with processed data
        dispatch(setFiles(files));
        return processingFile;
      }

      if (processingFile.processing_status === 'failed') {
        dispatch(clearFileProcessing(fileId));
        dispatch(setFileError({ 
          fileId, 
          error: processingFile.error_message || 'Processing failed' 
        }));
        throw new Error('File processing failed');
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // If we reach here, processing took too long
    dispatch(clearFileProcessing(fileId));
    dispatch(setFileError({ 
      fileId, 
      error: 'Processing timeout' 
    }));
    throw new Error('Processing timeout');
  }
);
