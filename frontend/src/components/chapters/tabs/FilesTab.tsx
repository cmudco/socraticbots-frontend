// src/components/chapters/tabs/FilesTab.tsx
import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  uploadChapterFile, 
  uploadMultipleFiles,
  deleteChapterFile,
  fetchChapterFiles
} from '../../../store/thunks/fileThunks';
import { ChapterFile } from '../../../services/files.service';
import FileListItem from './FileListItem';

const FilesTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    files,
    uploadProgress,
    processingFiles,
    fileErrors,
    originalChapter
  } = useAppSelector(state => state.chapterForm);

  // Add refresh interval for processing files
  useEffect(() => {
    if (!originalChapter?.id || processingFiles.length === 0) return;

    // Refresh file list every 3 seconds while files are processing
    const intervalId = setInterval(() => {
      dispatch(fetchChapterFiles({ chapterPublicId: originalChapter.id }));
    }, 3000);

    return () => clearInterval(intervalId);
  }, [dispatch, originalChapter?.id, processingFiles.length]);

  // Initial file fetch
  useEffect(() => {
    if (originalChapter?.id) {
      dispatch(fetchChapterFiles({ chapterPublicId: originalChapter.id }));
    }
  }, [dispatch, originalChapter?.id]);

  // File drop handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!originalChapter?.id) return;
    
    try {
      if (acceptedFiles.length === 1) {
        await dispatch(uploadChapterFile({
          chapterPublicId: originalChapter.id,
          file: acceptedFiles[0]
        })).unwrap();
      } else {
        await dispatch(uploadMultipleFiles({
          chapterPublicId: originalChapter.id,
          files: acceptedFiles
        })).unwrap();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [dispatch, originalChapter]);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // Handle file deletion
  const handleDelete = async (file: ChapterFile) => {
    if (!originalChapter?.id) {
      alert("Can't delete file: chapter information missing");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      try {
        await dispatch(deleteChapterFile({ 
          chapterPublicId: originalChapter.id, 
          fileId: file.id 
        })).unwrap();
        
        dispatch(fetchChapterFiles({ chapterPublicId: originalChapter.id }));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="p-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14M8 14c0-4.418 3.582-8 8-8h16c4.418 0 8 3.582 8 8m-9 8v12m-6-12v12"
            />
          </svg>
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Supports: PDF, DOC, DOCX, TXT
          </p>
        </div>
      </div>

      {/* File List */}
      <div className="mt-6 space-y-4">
        {files.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No files uploaded yet
          </div>
        ) : (
          files.map(file => (
            <FileListItem
              key={file.id}
              file={file}
              progress={uploadProgress[file.id]}
              isProcessing={processingFiles.includes(file.id)}
              error={fileErrors[file.id]}
              onDelete={() => handleDelete(file)}
            />
          ))
        )}
      </div>

      {/* Optional: Add a processing files indicator */}
      {processingFiles.length > 0 && (
        <div className="mt-4 text-sm text-yellow-600">
          Processing {processingFiles.length} file(s)...
        </div>
      )}
    </div>
  );
};

export default FilesTab;
