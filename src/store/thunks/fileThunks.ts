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
      const tempId = `temp-${Date.now()}`;
      dispatch(clearFileError(tempId));
      
      const uploadedFile = await fileService.uploadChapterFile(
        chapterPublicId, 
        file,
        (progress) => {
          dispatch(setUploadProgress({ fileId: tempId, progress }));
        }
      );

      dispatch(clearUploadProgress(tempId));
      
      if (uploadedFile.processing_status === 'processing' || 
          uploadedFile.processing_status === 'pending') {
        dispatch(setFileProcessing(uploadedFile.id));
        // Start polling for processing status
        dispatch(pollFileProcessing({ 
          chapterPublicId, 
          fileId: uploadedFile.id 
        }));
      }

      dispatch(addFile(uploadedFile));
      return uploadedFile;
    } catch (error: any) {
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
    { chapterPublicId, fileId }: { chapterPublicId: string, fileId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await fileService.deleteFile(fileId, chapterPublicId);
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
    if (false) {
      console.log('getState', getState());
    }
    
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
      error: 'Large file is still processing. Please check back later for results.' 
    }));
    // Don't throw an error, just return a status
    return { id: fileId, status: 'long_running' };
  }
);
