/**
 * API service for Voice Agents.
 */
import { METHOD } from '@/constants/requests';

import {
  voiceConversationListItemSchema,
  voiceConversationSchema,
  voiceSessionStatusSchema,
} from '@/lib/voiceApiContract';

import { baseRequest } from '@/utils/baseRequest';

import {
  AgentMembersResponse,
  ElevenLabsAgentItem,
  KokoroVoicesResponse,
  SignedUrlResponse,
  StudentAttemptInfo,
  VoiceAgent,
  VoiceAgentCreateData,
  VoiceAgentListItem,
  VoiceAgentMembership,
  VoiceAgentUpdateData,
  VoiceBrainModelsResponse,
  VoiceConversation,
  VoiceConversationListItem,
  VoiceSessionStatusResponse,
  VoiceTeamMembership,
  VoiceTeamWithMembers,
} from '@/types/voiceAgent';
import type { VoiceBrowserDiagnosticRequest } from '@/types/voiceDiagnostics';

class VoiceAgentService {
  async reportBrowserDiagnostics(
    agentId: number,
    data: VoiceBrowserDiagnosticRequest
  ): Promise<void> {
    await baseRequest<unknown>({
      url: `voice/agents/${agentId}/browser_diagnostics/`,
      method: METHOD.POST,
      data,
      timeoutMs: 5000,
    });
  }
  // ============ Voice Agents ============

  async getVoiceAgents(): Promise<VoiceAgentListItem[]> {
    return baseRequest<VoiceAgentListItem[]>({
      url: 'voice/agents/',
      method: METHOD.GET,
    });
  }

  async getBrainModels(): Promise<VoiceBrainModelsResponse> {
    return baseRequest<VoiceBrainModelsResponse>({
      url: 'voice/brain-models/',
      method: METHOD.GET,
    });
  }

  async getKokoroVoices(): Promise<KokoroVoicesResponse> {
    return baseRequest<KokoroVoicesResponse>({
      url: 'voice/kokoro-voices/',
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

  async cloneVoiceAgent(id: number): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: `voice/agents/${id}/clone/`,
      method: METHOD.POST,
    });
  }

  // ============ Signed URL & Sessions ============

  async getSignedUrl(agentId: number): Promise<SignedUrlResponse> {
    return baseRequest<SignedUrlResponse>({
      url: `voice/agents/${agentId}/get_signed_url/`,
      method: METHOD.POST,
      timeoutMs: 15000,
    });
  }

  async getSessionStatus(
    agentId: number,
    conversationId: string
  ): Promise<VoiceSessionStatusResponse> {
    return voiceSessionStatusSchema.parse(
      await baseRequest<unknown>({
        url: `voice/agents/${agentId}/session_status/`,
        params: { conversation_id: conversationId },
        timeoutMs: 5000,
      })
    );
  }

  async startSttLabSession(): Promise<SignedUrlResponse> {
    return baseRequest<SignedUrlResponse>({
      url: 'voice/lab/session/',
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

  async cancelConversation(
    agentId: number,
    conversationId: string,
    endedReason: string
  ): Promise<VoiceConversation> {
    return voiceConversationSchema.parse(
      await baseRequest<unknown>({
        url: `voice/agents/${agentId}/cancel_conversation/`,
        method: METHOD.POST,
        timeoutMs: 5000,
        data: { conversationId, endedReason },
      })
    );
  }

  // ============ Conversations ============

  async getConversations(): Promise<VoiceConversationListItem[]> {
    return voiceConversationListItemSchema.array().parse(
      await baseRequest<unknown>({
        url: 'voice/conversations/',
        method: METHOD.GET,
      })
    );
  }

  async getConversationsByAgent(agentId: number): Promise<VoiceConversationListItem[]> {
    return voiceConversationListItemSchema.array().parse(
      await baseRequest<unknown>({
        url: `voice/conversations/?agent_id=${agentId}`,
        method: METHOD.GET,
      })
    );
  }

  async getConversationById(id: number): Promise<VoiceConversation> {
    return voiceConversationSchema.parse(
      await baseRequest<unknown>({
        url: `voice/conversations/${id}/`,
        method: METHOD.GET,
      })
    );
  }

  async deleteConversation(id: number): Promise<void> {
    await baseRequest<void>({
      url: `voice/conversations/${id}/`,
      method: METHOD.DELETE,
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

  async exportAllTranscriptsPdf(agentId?: number): Promise<{ blob: Blob; filename: string }> {
    const url = agentId
      ? `voice/conversations/export-all/?agent_id=${agentId}`
      : 'voice/conversations/export-all/';
    return baseRequest({
      url,
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

  async syncFromElevenLabs(id: number): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: `voice/agents/${id}/sync_from_elevenlabs/`,
      method: METHOD.POST,
    });
  }

  async importElevenLabsAgent(agentId: string): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: 'voice/agents/import_agent/',
      method: METHOD.POST,
      data: { agentId },
    });
  }

  async redeemAccessCode(accessCode: string): Promise<VoiceAgent> {
    return baseRequest<VoiceAgent>({
      url: 'voice/agents/redeem_access_code/',
      method: METHOD.POST,
      data: { accessCode },
    });
  }

  // ============ Teams ============

  async getMyTeams(): Promise<VoiceTeamWithMembers[]> {
    return baseRequest<VoiceTeamWithMembers[]>({
      url: 'voice/agents/my_teams/',
      method: METHOD.GET,
    });
  }

  // ============ Shared Access (Members) ============

  async getAgentMembers(agentId: number): Promise<AgentMembersResponse> {
    return baseRequest<AgentMembersResponse>({
      url: `voice/agents/${agentId}/members/`,
      method: METHOD.GET,
    });
  }

  async addAgentMember(
    agentId: number,
    email: string,
    role: string,
    scope: 'team' | 'agent' = 'agent'
  ): Promise<VoiceTeamMembership | VoiceAgentMembership> {
    return baseRequest({
      url: `voice/agents/${agentId}/add-member/`,
      method: METHOD.POST,
      data: { email, role, scope },
    });
  }

  async removeAgentMember(
    agentId: number,
    membershipId: number,
    scope: 'team' | 'agent' = 'agent'
  ): Promise<void> {
    await baseRequest<void>({
      url: `voice/agents/${agentId}/remove-member/`,
      method: METHOD.POST,
      data: { membershipId, scope },
    });
  }

  // ============ Student Attempts ============

  async getStudentAttempts(agentId: number): Promise<StudentAttemptInfo[]> {
    return baseRequest<StudentAttemptInfo[]>({
      url: `voice/agents/${agentId}/students/`,
      method: METHOD.GET,
    });
  }

  async grantRetake(agentId: number, email: string, maxAttempts: number): Promise<void> {
    await baseRequest<void>({
      url: `voice/agents/${agentId}/grant-retake/`,
      method: METHOD.POST,
      data: { email, maxAttempts },
    });
  }
}

export const voiceAgentService = new VoiceAgentService();
