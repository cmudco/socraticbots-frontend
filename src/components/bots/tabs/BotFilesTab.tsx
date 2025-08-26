import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AlertCircle, Clock, Download, File, Trash2, Upload } from 'lucide-react';

import { useBotFiles, useRemoveBotFile, useUploadBotFiles } from '@/hooks/queries/useBotFiles';

import { BotFile } from '@/services/botFiles.service';

import { FileStatus } from '@/utils/fileStatus';

import { FileStatusBadge } from '@/components/FileStatusBadge';
import { Button } from '@/components/ui/button';

interface BotFilesTabProps {
  botGroupId: number;
  botId: number;
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <File className="h-8 w-8 text-red-500 dark:text-red-400" />;
    case 'doc':
    case 'docx':
      return <File className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
    case 'txt':
      return <File className="text-muted-foreground h-8 w-8" />;
    default:
      return <File className="text-muted-foreground h-8 w-8" />;
  }
};

const BotFilesTab: React.FC<BotFilesTabProps> = ({ botGroupId, botId }) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [enablePolling, setEnablePolling] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: filesData, isLoading, error } = useBotFiles(botGroupId, botId, { enablePolling });
  const uploadMutation = useUploadBotFiles();
  const removeMutation = useRemoveBotFile();

  // Enable polling when there are processing files
  useEffect(() => {
    const hasProcessingFiles =
      filesData?.files?.some(file => file.status === FileStatus.PROCESSING) || false;

    if (hasProcessingFiles && !enablePolling) {
      setEnablePolling(true);
    } else if (!hasProcessingFiles && enablePolling) {
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
            onSuccess: () => {
              setUploadingFiles([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            },
            onError: error => {
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
        <div className="py-8 text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h3 className="text-foreground mb-2 text-lg font-medium">Failed to load files</h3>
          <p className="text-muted-foreground">
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
          dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-border/80'
        } ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="text-muted-foreground mx-auto h-10 w-10" />
        <div className="mt-3">
          <p className="text-foreground font-medium">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">or</p>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            variant="outline"
            className="mt-2"
          >
            Choose files
          </Button>
          <p className="text-muted-foreground mt-1 text-xs">
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
          <h4 className="text-foreground font-medium">Uploading files...</h4>
          {uploadingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
            >
              {getFileIcon(file.name.split('.').pop() || '')}
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">{file.name}</p>
                <p className="text-muted-foreground text-sm">
                  {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Size unknown'}
                </p>
              </div>
              <Clock className="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      {isLoading ? (
        <div className="py-8 text-center">
          <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading files...</p>
        </div>
      ) : filesData && filesData.files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-foreground font-medium">Files ({filesData.count})</h4>
          </div>

          <div className="space-y-2">
            {filesData.files.map(file => (
              <div
                key={file.id}
                className={`rounded-lg border p-3 transition-all ${
                  file.status === FileStatus.PROCESSING
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : file.status === FileStatus.PROCESSED
                      ? 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                      : file.status === FileStatus.FAILED
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                        : 'border-border bg-background hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.fileType)}
                    <div className="min-w-0 flex-1">
                      <h5 className="text-foreground truncate font-medium">{file.name}</h5>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        {file.wordCount && <span>{file.wordCount.toLocaleString()} words</span>}
                        {file.wordCount && <span>•</span>}
                        {file.uploadedAt && (
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        )}
                        {file.size > 0 && (
                          <>
                            <span>•</span>
                            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          </>
                        )}
                      </div>
                      {file.errorMessage && (
                        <p className="text-destructive mt-1 text-sm">{file.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div className="flex items-center gap-1">
                      <FileStatusBadge status={file.status} errorMessage={file.errorMessage} />
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
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
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
        <div className="py-8 text-center">
          <h3 className="text-foreground mb-2 text-lg font-medium">No files uploaded</h3>
          <p className="text-muted-foreground">
            Upload files to help your AI bot provide more accurate and contextual responses.
          </p>
        </div>
      )}
    </div>
  );
};

export default BotFilesTab;
