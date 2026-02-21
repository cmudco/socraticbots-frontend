/**
 * React Query hooks for voice conversations.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { VoiceConversation, VoiceConversationListItem } from '@/types/voiceAgent';

// Query keys
const CONVERSATION_KEYS = {
  all: ['voice-conversations'] as const,
  list: () => [...CONVERSATION_KEYS.all, 'list'] as const,
  detail: (id: number) => [...CONVERSATION_KEYS.all, 'detail', id] as const,
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
  return useMutation<{ blob: Blob; filename: string }, Error, void>({
    mutationFn: () => voiceAgentService.exportAllTranscriptsPdf(),
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
