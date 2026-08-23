import { create } from 'zustand';

import { UserAccessInfo } from '@/types/botAccess';

interface RemoveAccessModalState {
  isOpen: boolean;
  userId: number;
  userEmail: string;
  userName: string;
  accessType: string;
}

interface ConversationsSlideOverState {
  isOpen: boolean;
  user: UserAccessInfo | null;
}

interface AnonymousConversationViewState {
  isOpen: boolean;
  conversationId: string | null;
}

interface BotAccessState {
  // UI State
  removingUserId: number | null;
  activeTab: 'users' | 'anonymous';

  // Modal State
  removeAccessModal: RemoveAccessModalState;
  conversationsSlideOver: ConversationsSlideOverState;
  anonymousConversationView: AnonymousConversationViewState;

  // Actions
  setRemovingUserId: (userId: number | null) => void;
  setActiveTab: (tab: 'users' | 'anonymous') => void;

  // Remove Access Modal Actions
  openRemoveAccessModal: (
    userId: number,
    userEmail: string,
    userName: string,
    accessType: string
  ) => void;
  closeRemoveAccessModal: () => void;

  // Conversations Slide-over Actions
  openConversationsSlideOver: (user: UserAccessInfo) => void;
  closeConversationsSlideOver: () => void;

  // Anonymous Conversation View Actions
  openAnonymousConversationView: (conversationId: string) => void;
  closeAnonymousConversationView: () => void;

  // Reset
  resetStore: () => void;
}

const initialRemoveAccessModal: RemoveAccessModalState = {
  isOpen: false,
  userId: 0,
  userEmail: '',
  userName: '',
  accessType: '',
};

const initialConversationsSlideOver: ConversationsSlideOverState = {
  isOpen: false,
  user: null,
};

const initialAnonymousConversationView: AnonymousConversationViewState = {
  isOpen: false,
  conversationId: null,
};

export const useBotAccessStore = create<BotAccessState>(set => ({
  // Initial State
  removingUserId: null,
  activeTab: 'users',
  removeAccessModal: initialRemoveAccessModal,
  conversationsSlideOver: initialConversationsSlideOver,
  anonymousConversationView: initialAnonymousConversationView,

  // Actions
  setRemovingUserId: userId => set({ removingUserId: userId }),
  setActiveTab: tab => set({ activeTab: tab }),

  // Remove Access Modal Actions
  openRemoveAccessModal: (userId, userEmail, userName, accessType) =>
    set({
      removeAccessModal: {
        isOpen: true,
        userId,
        userEmail,
        userName,
        accessType,
      },
    }),
  closeRemoveAccessModal: () =>
    set({
      removeAccessModal: initialRemoveAccessModal,
    }),

  // Conversations Slide-over Actions
  openConversationsSlideOver: user =>
    set({
      conversationsSlideOver: {
        isOpen: true,
        user,
      },
    }),
  closeConversationsSlideOver: () =>
    set({
      conversationsSlideOver: initialConversationsSlideOver,
    }),

  // Anonymous Conversation View Actions
  openAnonymousConversationView: conversationId =>
    set({
      anonymousConversationView: {
        isOpen: true,
        conversationId,
      },
    }),
  closeAnonymousConversationView: () =>
    set({
      anonymousConversationView: initialAnonymousConversationView,
    }),

  // Reset
  resetStore: () =>
    set({
      removingUserId: null,
      activeTab: 'users',
      removeAccessModal: initialRemoveAccessModal,
      conversationsSlideOver: initialConversationsSlideOver,
      anonymousConversationView: initialAnonymousConversationView,
    }),
}));
