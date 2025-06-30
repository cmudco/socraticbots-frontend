// src/components/chapters/tabs/FilesTab.tsx
import React, { useEffect } from 'react';

import { useChapterFiles } from '@/hooks/queries/useFiles';
import { useFileUpload } from '@/hooks/useFileUpload';

import { useChapterFormStore } from '@/stores/forms/chapterFormStore';

import FileItem from '@/components/files/FileItem';
import FileStatusSummary from '@/components/files/FileStatusSummary';
import FileUploadArea from '@/components/files/FileUploadArea';
import UploadingFileItem from '@/components/files/UploadingFileItem';
import ConfirmationModal from '@/components/ui/confirmation-modal';

import { FileProcessingStatus } from '@/types/file';

const FilesTab: React.FC = () => {
  const { originalChapter } = useChapterFormStore();
  const chapterId = originalChapter?.id;

  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useChapterFiles(chapterId || '', undefined, !!chapterId);

  const {
    uploadingFiles,
    deleteModal,
    handleFilesSelected,
    handleDelete,
    confirmDelete,
    cancelDelete,
    isUploading,
    isDeleting,
  } = useFileUpload(chapterId || '');

  // Auto-refresh to check for processing status updates
  useEffect(() => {
    const processingFiles = files.filter(
      f =>
        f.processing_status === FileProcessingStatus.PROCESSING ||
        f.processing_status === FileProcessingStatus.PENDING
    );

    if (processingFiles.length > 0) {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [files, refetch]);

  // Show message if no chapter ID (chapter not saved yet)
  if (!chapterId) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">File Upload</h3>
          <p className="mt-1 text-sm text-gray-500">
            File upload will be available after the chapter is created and saved.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading files</h3>
          <p className="mt-1 text-sm text-gray-500">
            There was an error loading the files. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Files</h3>
        <p className="mt-1 text-sm text-gray-500">Upload and manage files for this chapter</p>
        <FileStatusSummary files={files} uploadingFiles={uploadingFiles} />
      </div>

      {/* Upload Area */}
      <FileUploadArea onFilesSelected={handleFilesSelected} disabled={isUploading} />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Uploading Files</h4>
          <div className="flex flex-col gap-2">
            {uploadingFiles.map(file => (
              <UploadingFileItem key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ) : files.length > 0 ? (
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Uploaded Files</h4>
          <div className="flex flex-col gap-2">
            {files.map(file => (
              <FileItem key={file.id} file={file} onDelete={handleDelete} isDeleting={isDeleting} />
            ))}
          </div>
        </div>
      ) : (
        uploadingFiles.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-gray-500">No files uploaded yet</p>
          </div>
        )
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteModal.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FilesTab;
