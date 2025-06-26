// src/hooks/queries/useModels.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';

// Define the Model type
export interface Model {
  id: string;
  name: string;
  description?: string;
  // Add other properties as needed based on your API response
}

// Query Keys
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
};

/**
 * Get all available models
 * TODO: Implement actual API call when models service is available
 */
export const useModels = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: modelKeys.lists(),
    queryFn: async (): Promise<Model[]> => {
      // Return empty array until the models API is implemented
      // This prevents mock data from showing in the UI
      return [];
    },
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
