import { useEffect, useRef } from 'react';
import { useBotFiles } from '@/hooks/queries/useBotFiles';
import { BotFile } from '@/services/botFiles.service';

interface FileStatusPollerProps {
  botGroupId: number;
  botId: number;
  onProcessingComplete?: () => void;
  onProcessingStart?: () => void;
  onFileStatusChange?: (files: BotFile[]) => void;
}

export const FileStatusPoller: React.FC<FileStatusPollerProps> = ({
  botGroupId,
  botId,
  onProcessingComplete,
  onProcessingStart,
  onFileStatusChange,
}) => {
  const prevProcessingCount = useRef<number>(0);

  const { 
    data,
    isLoading,
    error 
  } = useBotFiles(botGroupId, botId);

  // Extract file arrays from data
  const processingFiles = data?.files?.filter((file: BotFile) => file.status === 1) || []; // PROCESSING = 1
  const processedFiles = data?.files?.filter((file: BotFile) => file.status === 2) || []; // PROCESSED = 2
  const failedFiles = data?.files?.filter((file: BotFile) => file.status === 3) || []; // FAILED = 3

  // Call onFileStatusChange when files change
  useEffect(() => {
    if (data?.files && onFileStatusChange) {
      onFileStatusChange(data.files);
    }
  }, [data?.files, onFileStatusChange]);

  useEffect(() => {
    if (isLoading || !data?.files) return;

    const currentProcessingCount = processingFiles.length;
    
    // Detect when processing starts
    if (prevProcessingCount.current === 0 && currentProcessingCount > 0) {
      onProcessingStart?.();
    }
    
    // Detect when all processing is complete
    if (prevProcessingCount.current > 0 && currentProcessingCount === 0) {
      onProcessingComplete?.();
    }
    
    prevProcessingCount.current = currentProcessingCount;
  }, [processingFiles.length, isLoading, data?.files, onProcessingStart, onProcessingComplete]);

  // Log status changes for debugging
  useEffect(() => {
    if (data?.files) {
      console.log('[FileStatusPoller] Status summary:', {
        total: data.files.length,
        processing: processingFiles.length,
        processed: processedFiles.length,
        failed: failedFiles.length,
        hasProcessingFiles: processingFiles.length > 0,
      });
    }
  }, [data?.files, processingFiles.length, processedFiles.length, failedFiles.length]);

  if (error) {
    console.error('[FileStatusPoller] Error polling file status:', error);
  }

  // This component doesn't render anything visible
  return null;
};

// Hook for easier integration in components
export const useFileStatusPoller = (
  botGroupId: number,
  botId: number,
  callbacks?: {
    onProcessingComplete?: () => void;
    onProcessingStart?: () => void;
    onFileStatusChange?: (files: BotFile[]) => void;
  }
) => {
  const query = useBotFiles(botGroupId, botId);
  
  const prevProcessingCount = useRef<number>(0);

  // Extract file arrays from data
  const processingFiles = query.data?.files?.filter((file: BotFile) => file.status === 1) || [];
  const processedFiles = query.data?.files?.filter((file: BotFile) => file.status === 2) || [];
  const failedFiles = query.data?.files?.filter((file: BotFile) => file.status === 3) || [];

  useEffect(() => {
    if (query.isLoading || !query.data?.files) return;

    const currentProcessingCount = processingFiles.length;
    
    if (prevProcessingCount.current === 0 && currentProcessingCount > 0) {
      callbacks?.onProcessingStart?.();
    }
    
    if (prevProcessingCount.current > 0 && currentProcessingCount === 0) {
      callbacks?.onProcessingComplete?.();
    }
    
    prevProcessingCount.current = currentProcessingCount;
  }, [processingFiles.length, query.isLoading, query.data?.files, callbacks]);

  // Call onFileStatusChange when files change
  useEffect(() => {
    if (query.data?.files && callbacks?.onFileStatusChange) {
      callbacks.onFileStatusChange(query.data.files);
    }
  }, [query.data?.files, callbacks?.onFileStatusChange]);

  return {
    ...query,
    processingFiles,
    processedFiles,
    failedFiles,
    hasProcessingFiles: processingFiles.length > 0,
    // Utility methods for status checking
    getFileById: (fileId: number) => query.data?.files?.find((f: BotFile) => f.id === fileId),
    getFileStatus: (fileId: number) => {
      const file = query.data?.files?.find((f: BotFile) => f.id === fileId);
      return file?.status || 0;
    },
    isFileProcessing: (fileId: number) => {
      return processingFiles.some((f: BotFile) => f.id === fileId);
    },
    isFileProcessed: (fileId: number) => {
      return processedFiles.some((f: BotFile) => f.id === fileId);
    },
    isFileFailed: (fileId: number) => {
      return failedFiles.some((f: BotFile) => f.id === fileId);
    },
  };
};