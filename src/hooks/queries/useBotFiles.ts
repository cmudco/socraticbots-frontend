import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { botFileService, BotFileUploadRequest } from '@/services/botFiles.service';
import { FileStatus } from '@/utils/fileStatus';

export const useBotFiles = (
  botGroupId: number, 
  botId: number, 
  options?: { enablePolling?: boolean }
) => {
  const { enablePolling = false } = options || {};

  const query = useQuery({
    queryKey: ['bot-files', botGroupId, botId],
    queryFn: async () => {
      console.log('[useBotFiles] Fetching bot files...');
      const result = await botFileService.getBotFiles(botGroupId, botId);
      console.log('[useBotFiles] Got files:', result);
      return result;
    },
    refetchInterval: enablePolling ? (query) => {
      console.log('[useBotFiles] Checking if should continue polling...');
      
      // Always poll if no data yet
      if (!query.state.data) {
        console.log('[useBotFiles] No data yet, continuing polling...');
        return 5000;
      }
      
      // If no data yet, start polling anyway (data will be available on first fetch)
      if (!query.state.data || !query.state.data.files) {
        console.log('[useBotFiles] No data yet, starting polling...');
        return 5000;
      }
      
      const hasProcessingFiles = query.state.data.files.some((file: any) => file.status === FileStatus.PROCESSING);
      console.log('[useBotFiles] Polling enabled, has processing files:', hasProcessingFiles);
      
      if (hasProcessingFiles) {
        console.log('[useBotFiles] Continuing to poll every 5 seconds...');
        return 5000; // Poll every 5 seconds when files are processing
      } else {
        console.log('[useBotFiles] No processing files, stopping polling');
        return false; // Stop polling when no files are processing
      }
    } : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: enablePolling ? 0 : 30000, // No caching when polling
  });

  return {
    ...query,
    hasProcessingFiles: query.data?.files?.some((file: any) => file.status === FileStatus.PROCESSING) || false,
  };
};

export const useUploadBotFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      botGroupId,
      botId,
      uploadData,
    }: {
      botGroupId: number;
      botId: number;
      uploadData: BotFileUploadRequest;
    }) => {
      return botFileService.uploadBotFiles(botGroupId, botId, uploadData);
    },
    onSuccess: (_, variables) => {
      // Invalidate bot files query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['bot-files', variables.botGroupId, variables.botId],
      });
    },
  });
};

export const useRemoveBotFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      botGroupId,
      botId,
      fileId,
      deleteFromDare = false,
    }: {
      botGroupId: number;
      botId: number;
      fileId: number;
      deleteFromDare?: boolean;
    }) => {
      return botFileService.removeBotFile(botGroupId, botId, fileId, deleteFromDare);
    },
    onSuccess: (_, variables) => {
      // Invalidate bot files query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['bot-files', variables.botGroupId, variables.botId],
      });
    },
  });
};