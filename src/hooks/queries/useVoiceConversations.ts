/**
 * React Query hooks for voice conversations.
 */
import { useEffect, useMemo } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { VoiceConversation, VoiceConversationListItem } from '@/types/voiceAgent';

// Query keys
const CONVERSATION_KEYS = {
  all: ['voice-conversations'] as const,
  list: () => [...CONVERSATION_KEYS.all, 'list'] as const,
  byAgent: (agentId: number) => [...CONVERSATION_KEYS.all, 'agent', agentId] as const,
  detail: (id: number) => [...CONVERSATION_KEYS.all, 'detail', id] as const,
  audio: (id: number) => [...CONVERSATION_KEYS.all, 'audio', id] as const,
};

/**
 * Hook to fetch all voice conversations.
 */
export function useVoiceConversations() {
  return useQuery<VoiceConversationListItem[]>({
    queryKey: CONVERSATION_KEYS.list(),
    queryFn: () => voiceAgentService.getConversations(),
  });
}

/**
 * Hook to fetch voice conversations for a specific agent.
 */
export function useAgentConversations(agentId: number) {
  return useQuery<VoiceConversationListItem[]>({
    queryKey: CONVERSATION_KEYS.byAgent(agentId),
    queryFn: () => voiceAgentService.getConversationsByAgent(agentId),
    enabled: agentId > 0,
  });
}

/**
 * Hook to fetch a single voice conversation by ID.
 */
export function useVoiceConversation(id: number) {
  return useQuery<VoiceConversation>({
    queryKey: CONVERSATION_KEYS.detail(id),
    queryFn: () => voiceAgentService.getConversationById(id),
    enabled: id > 0,
  });
}

/**
 * Hook to sync a conversation's transcript from ElevenLabs.
 */
export function useSyncConversationTranscript() {
  const queryClient = useQueryClient();

  return useMutation<VoiceConversation, Error, number>({
    mutationFn: (id: number) => voiceAgentService.syncConversationTranscript(id),
    onSuccess: data => {
      // Update the conversation in cache
      queryClient.setQueryData(CONVERSATION_KEYS.detail(data.id), data);
      // Invalidate the list to refresh status
      queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.list() });
    },
  });
}

/**
 * Hook to export a conversation transcript as PDF.
 */
export function useExportTranscriptPdf() {
  return useMutation<{ blob: Blob; filename: string }, Error, number>({
    mutationFn: (id: number) => voiceAgentService.exportTranscriptPdf(id),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook to export all conversation transcripts as a ZIP of PDFs.
 */
export function useExportAllTranscripts() {
  return useMutation<{ blob: Blob; filename: string }, Error, number | undefined>({
    mutationFn: (agentId?: number) => voiceAgentService.exportAllTranscriptsPdf(agentId),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook to fetch a conversation audio recording as a blob URL.
 *
 * Fetches via Axios (carries JWT auth header) and converts to a blob URL
 * suitable for use as <audio src>. The blob URL is revoked on unmount
 * to prevent memory leaks.
 *
 * Returns { blobUrl, isLoading } — blobUrl is null while loading or if no audioUrl provided.
 */
export function useConversationAudio(id: number, audioUrl: string | null) {
  const query = useQuery<Blob, Error>({
    queryKey: CONVERSATION_KEYS.audio(id),
    queryFn: () => voiceAgentService.fetchConversationAudioBlob(id),
    enabled: !!audioUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes — audio doesn't change
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const blobUrl = useMemo(
    () => (query.data ? URL.createObjectURL(query.data) : null),
    [query.data]
  );

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
     
  }, [blobUrl]);

  return { blobUrl, isLoading: query.isLoading };
}
