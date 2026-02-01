/**
 * Zustand store for Voice Agent feature.
 */
import { create } from 'zustand';

import { voiceAgentService } from '@/services/voiceAgent.service';

import {
  ElevenLabsAgentItem,
  ElevenLabsVoice,
  SignedUrlResponse,
  VoiceAgent,
  VoiceAgentCreateData,
  VoiceAgentListItem,
  VoiceAgentUpdateData,
  VoiceConversation,
  VoiceConversationListItem,
} from '@/types/voiceAgent';

interface VoiceAgentState {
  // Data
  agents: VoiceAgentListItem[];
  elevenlabsAgents: ElevenLabsAgentItem[];
  selectedAgent: VoiceAgent | null;
  conversations: VoiceConversationListItem[];
  selectedConversation: VoiceConversation | null;
  availableVoices: ElevenLabsVoice[];

  // Session state
  currentSignedUrl: string | null;
  currentConversationId: string | null;
  isConnected: boolean;

  // Loading states
  loading: boolean;
  loadingElevenlabsAgents: boolean;
  loadingVoices: boolean;
  loadingSignedUrl: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  importing: boolean;

  // Errors
  error: string | null;

  // Actions
  fetchAgents: () => Promise<void>;
  fetchAgentById: (id: number) => Promise<VoiceAgent | null>;
  createAgent: (data: VoiceAgentCreateData) => Promise<VoiceAgent | null>;
  updateAgent: (id: number, data: VoiceAgentUpdateData) => Promise<VoiceAgent | null>;
  deleteAgent: (id: number) => Promise<boolean>;
  getSignedUrl: (agentId: number) => Promise<SignedUrlResponse | null>;
  startConversation: (agentId: number, conversationId: string) => Promise<VoiceConversation | null>;
  endConversation: (agentId: number, conversationId: string) => Promise<VoiceConversation | null>;
  fetchVoices: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchConversationById: (id: number) => Promise<VoiceConversation | null>;
  fetchElevenLabsAgents: () => Promise<void>;
  importAgent: (agentId: string) => Promise<VoiceAgent | null>;
  setConnected: (value: boolean) => void;
  setCurrentConversationId: (id: string | null) => void;
  clearSession: () => void;
  clearSelectedAgent: () => void;
  clearError: () => void;
}

export const useVoiceAgentStore = create<VoiceAgentState>(set => ({
  // Initial state
  agents: [],
  elevenlabsAgents: [],
  selectedAgent: null,
  conversations: [],
  selectedConversation: null,
  availableVoices: [],

  currentSignedUrl: null,
  currentConversationId: null,
  isConnected: false,

  loading: false,
  loadingElevenlabsAgents: false,
  loadingVoices: false,
  loadingSignedUrl: false,
  creating: false,
  updating: false,
  deleting: false,
  importing: false,

  error: null,

  // Actions
  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const agents = await voiceAgentService.getVoiceAgents();
      set({ agents, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
      });
    }
  },

  fetchAgentById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const agent = await voiceAgentService.getVoiceAgentById(id);
      set({ selectedAgent: agent, loading: false });
      return agent;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agent',
      });
      return null;
    }
  },

  createAgent: async (data: VoiceAgentCreateData) => {
    set({ creating: true, error: null });
    try {
      const agent = await voiceAgentService.createVoiceAgent(data);
      // Add to list
      set(state => ({
        agents: [
          {
            id: agent.id,
            user: agent.user,
            userEmail: agent.userEmail,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            examTitle: agent.examTitle,
            createdAt: agent.createdAt,
          },
          ...state.agents,
        ],
        creating: false,
      }));
      return agent;
    } catch (error) {
      set({
        creating: false,
        error: error instanceof Error ? error.message : 'Failed to create agent',
      });
      return null;
    }
  },

  updateAgent: async (id: number, data: VoiceAgentUpdateData) => {
    set({ updating: true, error: null });
    try {
      const agent = await voiceAgentService.updateVoiceAgent(id, data);
      // Update in list
      set(state => ({
        agents: state.agents.map(a =>
          a.id === id
            ? {
                id: agent.id,
                user: agent.user,
                userEmail: agent.userEmail,
                name: agent.name,
                description: agent.description,
                status: agent.status,
                examTitle: agent.examTitle,
                createdAt: agent.createdAt,
              }
            : a
        ),
        selectedAgent: state.selectedAgent?.id === id ? agent : state.selectedAgent,
        updating: false,
      }));
      return agent;
    } catch (error) {
      set({
        updating: false,
        error: error instanceof Error ? error.message : 'Failed to update agent',
      });
      return null;
    }
  },

  deleteAgent: async (id: number) => {
    set({ deleting: true, error: null });
    try {
      await voiceAgentService.deleteVoiceAgent(id);
      set(state => ({
        agents: state.agents.filter(a => a.id !== id),
        selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
        deleting: false,
      }));
      return true;
    } catch (error) {
      set({
        deleting: false,
        error: error instanceof Error ? error.message : 'Failed to delete agent',
      });
      return false;
    }
  },

  getSignedUrl: async (agentId: number) => {
    set({ loadingSignedUrl: true, error: null });
    try {
      const result = await voiceAgentService.getSignedUrl(agentId);
      set({ currentSignedUrl: result.signedUrl, loadingSignedUrl: false });
      return result;
    } catch (error) {
      set({
        loadingSignedUrl: false,
        error: error instanceof Error ? error.message : 'Failed to get signed URL',
      });
      return null;
    }
  },

  startConversation: async (agentId: number, conversationId: string) => {
    try {
      const conversation = await voiceAgentService.startConversation(agentId, conversationId);
      set({ currentConversationId: conversation.elevenlabsConversationId });
      return conversation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start conversation',
      });
      return null;
    }
  },

  endConversation: async (agentId: number, conversationId: string) => {
    try {
      const conversation = await voiceAgentService.endConversation(agentId, conversationId);
      set({
        currentConversationId: null,
        currentSignedUrl: null,
        isConnected: false,
      });
      return conversation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to end conversation',
      });
      return null;
    }
  },

  fetchVoices: async () => {
    set({ loadingVoices: true });
    try {
      const voices = await voiceAgentService.getVoices();
      set({ availableVoices: voices, loadingVoices: false });
    } catch {
      set({ loadingVoices: false });
    }
  },

  fetchConversations: async () => {
    try {
      const conversations = await voiceAgentService.getConversations();
      set({ conversations });
    } catch {
      // Silent fail for conversations list
    }
  },

  fetchConversationById: async (id: number) => {
    try {
      const conversation = await voiceAgentService.getConversationById(id);
      set({ selectedConversation: conversation });
      return conversation;
    } catch {
      return null;
    }
  },

  fetchElevenLabsAgents: async () => {
    set({ loadingElevenlabsAgents: true, error: null });
    try {
      const agents = await voiceAgentService.getElevenLabsAgents();
      set({ elevenlabsAgents: agents, loadingElevenlabsAgents: false });
    } catch (error) {
      set({
        loadingElevenlabsAgents: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ElevenLabs agents',
      });
    }
  },

  importAgent: async (agentId: string) => {
    set({ importing: true, error: null });
    try {
      const agent = await voiceAgentService.importElevenLabsAgent(agentId);
      // Add to local agents list
      set(state => ({
        agents: [
          {
            id: agent.id,
            user: agent.user,
            userEmail: agent.userEmail,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            examTitle: agent.examTitle,
            createdAt: agent.createdAt,
          },
          ...state.agents,
        ],
        // Mark as synced in elevenlabs agents list
        elevenlabsAgents: state.elevenlabsAgents.map(a =>
          a.agentId === agent.elevenlabsAgentId ? { ...a, isSynced: true } : a
        ),
        importing: false,
      }));
      return agent;
    } catch (error) {
      set({
        importing: false,
        error: error instanceof Error ? error.message : 'Failed to import agent',
      });
      return null;
    }
  },

  setConnected: (value: boolean) => {
    set({ isConnected: value });
  },

  setCurrentConversationId: (id: string | null) => {
    set({ currentConversationId: id });
  },

  clearSession: () => {
    set({
      currentSignedUrl: null,
      currentConversationId: null,
      isConnected: false,
    });
  },

  clearSelectedAgent: () => {
    set({ selectedAgent: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
