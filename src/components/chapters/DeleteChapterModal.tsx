import React, { useState } from 'react';
import { Chapter } from '../../services/chapters.service';
import { useDeleteChapter } from '../../hooks/queries/useChapters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chapter: Chapter;
  bookId: string;
}

const DeleteChapterModal: React.FC<DeleteChapterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  chapter, 
  bookId 
}) => {
  const [error, setError] = useState<string | null>(null);

  // TanStack Query mutation
  const deleteChapterMutation = useDeleteChapter();

  // Loading state from mutation
  const isDeleting = deleteChapterMutation.isPending;

  const handleDelete = async () => {
    try {
      setError(null);

      await deleteChapterMutation.mutateAsync({ bookId, chapterId: chapter.id });

      onClose();
      onSuccess();
    } catch (err) {
      setError('Failed to delete chapter. Please try again.');
      console.error('Error deleting chapter:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Chapter</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 pt-2">
            Are you sure you want to delete "<span className="font-semibold">{chapter.title}</span>"?
            This action cannot be undone and all associated data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Delete Chapter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChapterModal; 