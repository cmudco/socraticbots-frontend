import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { AIModel, modelsService } from '@/services/models.service';

export interface Model {
  id: string;
  name: string;
  description?: string;
}

export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  detail: (id: string) => [...modelKeys.all, 'detail', id] as const,
};

/**
 * Get all available models
 */
export const useModels = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: modelKeys.lists(),
    queryFn: async (): Promise<AIModel[]> => {
      return await modelsService.getModels();
    },
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Get a single model by ID
 */
export const useModel = (modelId: string) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: modelKeys.detail(modelId),
    queryFn: async (): Promise<AIModel> => {
      return await modelsService.getModel(modelId);
    },
    enabled: isAuthenticated && !!tokens?.access && !!modelId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
