import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BotFile, BotFileUploadRequest, botFileService } from '@/services/botFiles.service';

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
      const result = await botFileService.getBotFiles(botGroupId, botId);
      return result;
    },
    refetchInterval: enablePolling
      ? query => {
          if (!query.state.data) {
            return 5000;
          }

          if (!query.state.data || !query.state.data.files) {
            return 5000;
          }

          const hasProcessingFiles = query.state.data.files.some(
            (file: BotFile) => file.status === FileStatus.PROCESSING
          );

          if (hasProcessingFiles) {
            return 5000; // Poll every 5 seconds when files are processing
          } else {
            return false; // Stop polling when no files are processing
          }
        }
      : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: enablePolling ? 0 : 30000, // No caching when polling
  });

  return {
    ...query,
    hasProcessingFiles:
      query.data?.files?.some((file: BotFile) => file.status === FileStatus.PROCESSING) || false,
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
