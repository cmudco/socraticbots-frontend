/**
 * API service for Voice Agents.
 */
import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import {
  ElevenLabsAgentItem,
  SignedUrlResponse,
  VoiceAgent,
  VoiceAgentCreateData,
  VoiceAgentListItem,
  VoiceAgentUpdateData,
  VoiceConversation,
  VoiceConversationListItem,
} from '@/types/voiceAgent';

class VoiceAgentService {
  // ============ Voice Agents ============

  async getVoiceAgents(): Promise<VoiceAgentListItem[]> {
    return baseRequest<VoiceAgentListItem[]>({
      url: 'voice/agents/',
      method: METHOD.GET,
    });
  }

  async getVoiceAgentById(id: number): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: `voice/agents/${id}/`,
      method: METHOD.GET,
    });
  }

  async createVoiceAgent(data: VoiceAgentCreateData): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: 'voice/agents/',
      method: METHOD.POST,
      data,
    });
  }

  async updateVoiceAgent(id: number, data: VoiceAgentUpdateData): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: `voice/agents/${id}/`,
      method: METHOD.PATCH,
      data,
    });
  }

  async deleteVoiceAgent(id: number): Promise<void> {
    await baseRequest<void>({
      url: `voice/agents/${id}/`,
      method: METHOD.DELETE,
    });
  }

  // ============ Signed URL & Sessions ============

  async getSignedUrl(agentId: number): Promise<SignedUrlResponse> {
    return baseRequest<SignedUrlResponse>({
      url: `voice/agents/${agentId}/get_signed_url/`,
      method: METHOD.POST,
    });
  }

  async startConversation(agentId: number, conversationId: string): Promise<VoiceConversation> {
    return baseRequest<VoiceConversation>({
      url: `voice/agents/${agentId}/start_conversation/`,
      method: METHOD.POST,
      data: { conversationId },
    });
  }

  async endConversation(agentId: number, conversationId: string): Promise<VoiceConversation> {
    return baseRequest<VoiceConversation>({
      url: `voice/agents/${agentId}/end_conversation/`,
      method: METHOD.POST,
      data: { conversationId },
    });
  }

  // ============ Conversations ============

  async getConversations(): Promise<VoiceConversationListItem[]> {
    return baseRequest<VoiceConversationListItem[]>({
      url: 'voice/conversations/',
      method: METHOD.GET,
    });
  }

  async getConversationById(id: number): Promise<VoiceConversation> {
    return baseRequest<VoiceConversation>({
      url: `voice/conversations/${id}/`,
      method: METHOD.GET,
    });
  }

  async syncConversationTranscript(id: number): Promise<VoiceConversation> {
    return baseRequest<VoiceConversation>({
      url: `voice/conversations/${id}/sync_transcript/`,
      method: METHOD.POST,
    });
  }

  async exportTranscriptPdf(id: number): Promise<{ blob: Blob; filename: string }> {
    return baseRequest({
      url: `voice/conversations/${id}/export-pdf/`,
      method: METHOD.GET,
      responseType: 'blob',
    });
  }

  async exportAllTranscriptsPdf(): Promise<{ blob: Blob; filename: string }> {
    return baseRequest({
      url: 'voice/conversations/export-all/',
      method: METHOD.GET,
      responseType: 'blob',
    });
  }

  // ============ ElevenLabs Direct API ============

  async getElevenLabsAgents(): Promise<ElevenLabsAgentItem[]> {
    return baseRequest<ElevenLabsAgentItem[]>({
      url: 'voice/agents/elevenlabs_agents/',
      method: METHOD.GET,
    });
  }

  async importElevenLabsAgent(agentId: string): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: 'voice/agents/import_agent/',
      method: METHOD.POST,
      data: { agentId },
    });
  }
}

export const voiceAgentService = new VoiceAgentService();
