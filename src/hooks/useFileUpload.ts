import { useFilesStore } from '../stores/filesStore';
import { FileUploadStatus } from '../types/file';
import { useDeleteFile, useUploadFile } from './queries/useFiles';

export const useFileUpload = (chapterId: string) => {
  const {
    uploadingFiles,
    deleteModal,
    addUploadingFile,
    updateUploadingFile,
    removeUploadingFile,
    openDeleteModal,
    closeDeleteModal,
  } = useFilesStore();

  const uploadFileMutation = useUploadFile(chapterId);
  const deleteFileMutation = useDeleteFile(chapterId);

  const handleFilesSelected = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const fileId = `upload-${Date.now()}-${Math.random()}`;

      // Add to uploading files state
      addUploadingFile({
        id: fileId,
        name: file.name,
        progress: 0,
        status: FileUploadStatus.UPLOADING,
      });

      uploadFileMutation.mutate(
        {
          uploadData: { file, name: file.name },
          onProgress: progress => {
            updateUploadingFile(fileId, { progress });
          },
        },
        {
          onSuccess: () => {
            // Update status to processing
            updateUploadingFile(fileId, {
              status: FileUploadStatus.PROCESSING,
              progress: 100,
            });

            // Remove from uploading state after a delay to show completion
            setTimeout(() => {
              removeUploadingFile(fileId);
            }, 3000);
          },
          onError: error => {
            updateUploadingFile(fileId, {
              status: FileUploadStatus.ERROR,
              error: error instanceof Error ? error.message : 'Upload failed',
            });
          },
        }
      );
    });
  };

  const handleDelete = (fileId: string, fileName: string) => {
    openDeleteModal(fileId, fileName);
  };

  const confirmDelete = () => {
    if (deleteModal.fileId) {
      deleteFileMutation.mutate(deleteModal.fileId, {
        onSuccess: () => {
          closeDeleteModal();
        },
      });
    }
  };

  const cancelDelete = () => {
    closeDeleteModal();
  };

  return {
    uploadingFiles,
    deleteModal,
    handleFilesSelected,
    handleDelete,
    confirmDelete,
    cancelDelete,
    isUploading: uploadFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
  };
};
