// Status mapping from DARE backend - CORRECT VALUES:
// 0 = PROCESSING, 1 = PROCESSED, 2 = FAILED
export const FileStatus = {
  PROCESSING: 0,
  PROCESSED: 1, // This is COMPLETED
  FAILED: 2,
} as const;

export type FileStatusType = (typeof FileStatus)[keyof typeof FileStatus];

export const getFileStatusText = (status: number): string => {
  switch (status) {
    case FileStatus.PROCESSING:
      return 'processing';
    case FileStatus.PROCESSED:
      return 'processed';
    case FileStatus.FAILED:
      return 'failed';
    default:
      return 'unknown';
  }
};

export const getFileStatusColor = (status: number): string => {
  switch (status) {
    case FileStatus.PROCESSING:
      return 'text-primary bg-primary/10';
    case FileStatus.PROCESSED:
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    case FileStatus.FAILED:
      return 'text-destructive bg-destructive/10';
    default:
      return 'text-muted-foreground bg-muted/50';
  }
};

export const isFileProcessingComplete = (status: number): boolean => {
  return status === FileStatus.PROCESSED || status === FileStatus.FAILED;
};
