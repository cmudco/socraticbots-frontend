import React from 'react';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

import { FileStatus } from '@/utils/fileStatus';

import { Badge } from '@/components/ui/badge';

interface FileStatusBadgeProps {
  status: number;
  errorMessage?: string | null;
}

export const FileStatusBadge: React.FC<FileStatusBadgeProps> = ({ status, errorMessage }) => {
  switch (status) {
    case FileStatus.PROCESSING:
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          Processing
        </Badge>
      );

    case FileStatus.PROCESSED:
      return (
        <Badge variant="green">
          <CheckCircle className="mr-1 h-4 w-4" />
          Processed
        </Badge>
      );

    case FileStatus.FAILED:
      return (
        <Badge variant="destructive" title={errorMessage || 'Processing failed'}>
          <AlertCircle className="mr-1 h-4 w-4" />
          Failed
        </Badge>
      );

    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
