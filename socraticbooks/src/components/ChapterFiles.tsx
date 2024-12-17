import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadChapterFile, deleteChapterFile } from '../utils/storage';
import { ChapterFile } from '../types/file';
import { Upload, File, Trash2, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface ChapterFilesProps {
  chapterId: string;
}

const ChapterFiles: React.FC<ChapterFilesProps> = ({ chapterId }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<ChapterFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files
  useEffect(() => {
    const loadFiles = async () => {
      if (!user?.uid || !chapterId) return;

      try {
        const filesRef = collection(firestore, 'files');
        const q = query(
          filesRef, 
          where('userId', '==', user.uid),
          where('chapterId', '==', chapterId)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedFiles: ChapterFile[] = [];
        
        querySnapshot.forEach((doc) => {
          loadedFiles.push(doc.data() as ChapterFile);
        });

        setFiles(loadedFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading files');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [chapterId, user?.uid]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !user) return;

    // Validate file size (e.g., 50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > MAX_SIZE) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedFile = await uploadChapterFile(
        user.uid,
        chapterId,
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      setFiles(prev => [...prev, uploadedFile as ChapterFile]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [chapterId, user]);

  const handleDelete = async (fileId: string) => {
    if (!user) return;

    try {
      await deleteChapterFile(user.uid, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-center items-center h-20">
          <Loader className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Chapter Files</h3>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="application/pdf,image/*,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload File
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-600 rounded transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading... {uploadProgress.toFixed(1)}%
          </p>
        </div>
      )}

      <div className="space-y-3">
        {files.map((file) => (
          <div 
            key={file.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <File className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {file.vectorized ? (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Vectorized
                </span>
              ) : (
                <span className="flex items-center text-gray-400 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Not vectorized
                </span>
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-1 text-red-600 hover:text-red-800 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {files.length === 0 && !uploading && (
          <p className="text-gray-500 text-center py-4">
            No files uploaded yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ChapterFiles;