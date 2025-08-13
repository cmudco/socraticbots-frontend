import { useQuery } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

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
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: modelKeys.lists(),
    queryFn: async (): Promise<AIModel[]> => {
      return await modelsService.getModels();
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Get a single model by ID
 */
export const useModel = (modelId: string) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: modelKeys.detail(modelId),
    queryFn: async (): Promise<AIModel> => {
      return await modelsService.getModel(modelId);
    },
    enabled: isAuthenticated && !!modelId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
