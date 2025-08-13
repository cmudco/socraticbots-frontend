import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { dareLLMModelsService, DareLLMModel } from '@/services/dareLLMModels.service';

export const dareLLMModelKeys = {
  all: ['dareLLMModels'] as const,
  lists: () => [...dareLLMModelKeys.all, 'list'] as const,
  list: (filters?: string) => [...dareLLMModelKeys.lists(), { filters }] as const,
  details: () => [...dareLLMModelKeys.all, 'detail'] as const,
  detail: (id: number) => [...dareLLMModelKeys.details(), id] as const,
  search: (query: string) => [...dareLLMModelKeys.all, 'search', query] as const,
  provider: (provider: string) => [...dareLLMModelKeys.all, 'provider', provider] as const,
};

/**
 * Get all DARE LLM models
 */
export const useDareLLMModels = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: dareLLMModelKeys.lists(),
    queryFn: () => dareLLMModelsService.getDareLLMModels(),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get a single DARE LLM model by ID
 */
export const useDareLLMModel = (id: number, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: dareLLMModelKeys.detail(id),
    queryFn: () => dareLLMModelsService.getDareLLMModel(id),
    enabled: enabled && !!id && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Search DARE LLM models by query
 */
export const useSearchDareLLMModels = (query: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: dareLLMModelKeys.search(query),
    queryFn: () => dareLLMModelsService.searchDareLLMModels(query),
    enabled: enabled && !!query.trim() && isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get DARE LLM models by provider
 */
export const useDareLLMModelsByProvider = (provider: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: dareLLMModelKeys.provider(provider),
    queryFn: () => dareLLMModelsService.getDareLLMModelsByProvider(provider),
    enabled: enabled && !!provider && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Helper hook to get available providers from DARE LLM models
 */
export const useDareLLMProviders = () => {
  const { data: models, ...rest } = useDareLLMModels();

  const providers = models?.reduce((acc: string[], model: DareLLMModel) => {
    if (!acc.includes(model.provider)) {
      acc.push(model.provider);
    }
    return acc;
  }, []) || [];

  return {
    data: providers,
    ...rest,
  };
};