/**
 * TanStack Query hook for the live Mistral Voxtral voice catalog.
 * Backed by the server-side proxy at /api/voice/mistral-voices/ so the
 * key never touches the browser and the list stays fresh without a
 * frontend redeploy.
 */
import { useQuery } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { MistralVoicesResponse } from '@/types/voiceAgent';

export const mistralVoiceKeys = {
  all: ['mistralVoices'] as const,
  list: () => [...mistralVoiceKeys.all, 'list'] as const,
};

export const useMistralVoices = (enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery<MistralVoicesResponse>({
    queryKey: mistralVoiceKeys.list(),
    queryFn: () => voiceAgentService.getMistralVoices(),
    enabled: enabled && isAuthenticated,
    // The backend caches for 1 hour; keep client cache aligned.
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
