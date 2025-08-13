import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, File, Trash2, Download, AlertCircle, Clock } from 'lucide-react';

import { useBotFiles, useUploadBotFiles, useRemoveBotFile } from '@/hooks/queries/useBotFiles';
import { BotFile } from '@/services/botFiles.service';
import { useFilesStore } from '@/stores/core/filesStore';
import { FileStatusBadge } from '@/components/FileStatusBadge';
import { FileStatus } from '@/utils/fileStatus';

import { Button } from '@/components/ui/button';

interface BotFilesTabProps {
  botGroupId: number;
  botId: number;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <File className="h-8 w-8 text-red-500" />;
    case 'doc':
    case 'docx':
      return <File className="h-8 w-8 text-blue-500" />;
    case 'txt':
      return <File className="h-8 w-8 text-gray-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};


const BotFilesTab: React.FC<BotFilesTabProps> = ({ botGroupId, botId }) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [enablePolling, setEnablePolling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { dragActive, setDragActive } = useFilesStore();
  const { data: filesData, isLoading, error } = useBotFiles(botGroupId, botId, { enablePolling });
  const uploadMutation = useUploadBotFiles();
  const removeMutation = useRemoveBotFile();

  // Enable polling when there are processing files
  useEffect(() => {
    const hasProcessingFiles = filesData?.files?.some(file => file.status === FileStatus.PROCESSING) || false;
    console.log('[BotFilesTab] Has processing files:', hasProcessingFiles, 'Current polling enabled:', enablePolling);
    
    if (hasProcessingFiles && !enablePolling) {
      console.log('[BotFilesTab] Enabling polling for processing files');
      setEnablePolling(true);
    } else if (!hasProcessingFiles && enablePolling) {
      console.log('[BotFilesTab] Disabling polling - all files completed');
      setEnablePolling(false);
    }
  }, [filesData?.files, enablePolling]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setDragActive(true);
      }
    },
    [setDragActive]
  );

  const handleDragOut = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    },
    [setDragActive]
  );

  const handleFilesSelected = useCallback(
    (fileList: FileList) => {
      // Prevent duplicate uploads if already uploading
      if (uploadMutation.isPending) {
        console.warn('Upload already in progress, ignoring duplicate request');
        return;
      }

      const validFiles = Array.from(fileList).filter(file => {
        const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return validTypes.includes(extension);
      });

      if (validFiles.length !== fileList.length) {
        alert('Some files were skipped. Only PDF, DOC, DOCX, and TXT files are supported.');
      }

      if (validFiles.length > 0) {
        setUploadingFiles(validFiles);
        
        // Create a proper FileList from validFiles
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        const properFileList = dataTransfer.files;
        
        uploadMutation.mutate(
          {
            botGroupId,
            botId,
            uploadData: {
              files: properFileList,
            },
          },
          {
            onSuccess: (response) => {
              console.log('[BotFilesTab] Upload successful:', response);
              setUploadingFiles([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              // Files will be automatically refetched and polling will start if needed
            },
            onError: (error) => {
              console.error('Upload failed:', error);
              setUploadingFiles([]);
              alert('Upload failed. Please try again.');
            },
          }
        );
      }
    },
    [botGroupId, botId, uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesSelected(e.dataTransfer.files);
      }
    },
    [setDragActive, handleFilesSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleRemoveFile = useCallback(
    (fileId: number, fileName: string) => {
      if (confirm(`Are you sure you want to remove "${fileName}"?`)) {
        removeMutation.mutate({
          botGroupId,
          botId,
          fileId,
          deleteFromDare: false, // Keep the file in DARE, just remove from bot
        });
      }
    },
    [botGroupId, botId, removeMutation]
  );

  const handleDownloadFile = useCallback((file: BotFile) => {
    // For now, we'll use the secure file URL
    const downloadUrl = `/api/files/serve/${file.id}/`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load files</h3>
          <p className="text-gray-500">
            There was an error loading the files for this bot. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragActive ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-gray-400'
        } ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <div className="mt-3">
          <p className="font-medium text-gray-900">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="mt-1 text-sm text-gray-500">or</p>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            variant="outline"
            className="mt-2"
          >
            Choose files
          </Button>
          <p className="mt-1 text-xs text-gray-500">
            Supports PDF, DOC, DOCX, TXT files (Max 10MB each)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploading files...</h4>
          {uploadingFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              {getFileIcon(file.name.split('.').pop() || '')}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Size unknown'}
                </p>
              </div>
              <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-500">Loading files...</p>
        </div>
      ) : filesData && filesData.files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Files ({filesData.count})
            </h4>
          </div>
          
          <div className="space-y-2">
            {filesData.files.map((file) => (
              <div
                key={file.id}
                className={`rounded-lg border p-3 transition-all ${
                  file.status === FileStatus.PROCESSING
                    ? 'border-yellow-200 bg-yellow-50'
                    : file.status === FileStatus.PROCESSED
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : file.status === FileStatus.FAILED
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">{file.name}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {file.wordCount && (
                          <span>{file.wordCount.toLocaleString()} words</span>
                        )}
                        {file.wordCount && <span>•</span>}
                        {file.uploadedAt && <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>}
                        {file.size > 0 && (
                          <>
                            <span>•</span>
                            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          </>
                        )}
                      </div>
                      {file.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">{file.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div className="flex items-center gap-1">
                      <FileStatusBadge 
                        status={file.status} 
                        errorMessage={file.errorMessage} 
                      />
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {file.status === FileStatus.PROCESSED && (
                        <Button
                          onClick={() => handleDownloadFile(file)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleRemoveFile(file.id, file.name)}
                        disabled={removeMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-100"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
          <p className="text-gray-500">
            Upload files to help your AI bot provide more accurate and contextual responses.
          </p>
        </div>
      )}
    </div>
  );
};

export default BotFilesTab;