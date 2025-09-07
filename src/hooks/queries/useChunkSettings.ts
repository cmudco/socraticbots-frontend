import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type ChunkSettings, chunkSettingsService } from '@/services/chunkSettings.service';

export const useUpdateChunkSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: ChunkSettings) => chunkSettingsService.updateChunkSettings(settings),
    onSuccess: () => {
      // Invalidate userInfo so UI picks up latest values via user-info
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    },
  });
};
