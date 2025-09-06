import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

export interface ChunkSettings {
  chunkSize: number;
  overlapSize: number;
}

class ChunkSettingsService {
  async updateChunkSettings(settings: ChunkSettings): Promise<ChunkSettings> {
    const resp = await baseRequest<{ chunkSize: number; overlapSize: number }>({
      url: 'users/me/',
      method: METHOD.PATCH,
      data: {
        chunkSize: settings.chunkSize,
        overlapSize: settings.overlapSize,
      },
    });
    return { chunkSize: resp.chunkSize, overlapSize: resp.overlapSize };
  }
}

export const chunkSettingsService = new ChunkSettingsService();
