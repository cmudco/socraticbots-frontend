import { create } from 'zustand';

import type { Bot } from '@/types/bot';
import type { BotGroup } from '@/types/botGroup';

interface DeleteConfirmationModal {
  isOpen: boolean;
  itemId: string | null;
  itemTitle: string;
  itemType: string;
}

interface ModalStoreState {
  // Bot Group modals
  botGroupFormModal: {
    isOpen: boolean;
    botGroup: BotGroup | null;
    mode: 'create' | 'edit' | 'view';
  };
  deleteBotGroupModal: {
    isOpen: boolean;
    botGroup: BotGroup | null;
  };

  // Bot modals
  botFormModal: {
    isOpen: boolean;
    bot: Bot | null;
    botGroupId: number | null;
    mode: 'create' | 'edit' | 'view';
  };
  deleteBotModal: {
    isOpen: boolean;
    bot: Bot | null;
    botGroupId: number | null;
  };

  clearConversationModal: {
    isOpen: boolean;
  };

  deleteConfirmationModal: DeleteConfirmationModal;

  // Bot Group modal methods
  openBotGroupFormModal: (botGroup?: BotGroup, viewOnly?: boolean) => void;
  closeBotGroupFormModal: () => void;
  openDeleteBotGroupModal: (botGroup: BotGroup) => void;
  closeDeleteBotGroupModal: () => void;

  // Bot modal methods
  openBotFormModal: (botGroupId: number, bot?: Bot, viewOnly?: boolean) => void;
  closeBotFormModal: () => void;
  openDeleteBotModal: (botGroupId: number, bot: Bot) => void;
  closeDeleteBotModal: () => void;

  openClearConversationModal: () => void;
  closeClearConversationModal: () => void;

  openDeleteConfirmation: (itemId: string, itemTitle: string, itemType: string) => void;
  closeDeleteConfirmation: () => void;

  resetAllModals: () => void;
}

export const useModalStore = create<ModalStoreState>(set => ({
  // Bot Group modals
  botGroupFormModal: {
    isOpen: false,
    botGroup: null,
    mode: 'create',
  },
  deleteBotGroupModal: {
    isOpen: false,
    botGroup: null,
  },

  // Bot modals
  botFormModal: {
    isOpen: false,
    bot: null,
    botGroupId: null,
    mode: 'create',
  },
  deleteBotModal: {
    isOpen: false,
    bot: null,
    botGroupId: null,
  },

  clearConversationModal: {
    isOpen: false,
  },
  deleteConfirmationModal: {
    isOpen: false,
    itemId: null,
    itemTitle: '',
    itemType: '',
  },

  // Bot Group modal methods
  openBotGroupFormModal: (botGroup?: BotGroup, viewOnly?: boolean) =>
    set({
      botGroupFormModal: {
        isOpen: true,
        botGroup: botGroup || null,
        mode: viewOnly ? 'view' : botGroup ? 'edit' : 'create',
      },
    }),
  closeBotGroupFormModal: () =>
    set({
      botGroupFormModal: {
        isOpen: false,
        botGroup: null,
        mode: 'create',
      },
    }),
  openDeleteBotGroupModal: (botGroup: BotGroup) =>
    set({
      deleteBotGroupModal: {
        isOpen: true,
        botGroup,
      },
    }),
  closeDeleteBotGroupModal: () =>
    set({
      deleteBotGroupModal: {
        isOpen: false,
        botGroup: null,
      },
    }),

  // Bot modal methods
  openBotFormModal: (botGroupId: number, bot?: Bot, viewOnly?: boolean) =>
    set({
      botFormModal: {
        isOpen: true,
        bot: bot || null,
        botGroupId,
        mode: viewOnly ? 'view' : bot ? 'edit' : 'create',
      },
    }),
  closeBotFormModal: () =>
    set({
      botFormModal: {
        isOpen: false,
        bot: null,
        botGroupId: null,
        mode: 'create',
      },
    }),
  openDeleteBotModal: (botGroupId: number, bot: Bot) =>
    set({
      deleteBotModal: {
        isOpen: true,
        bot,
        botGroupId,
      },
    }),
  closeDeleteBotModal: () =>
    set({
      deleteBotModal: {
        isOpen: false,
        bot: null,
        botGroupId: null,
      },
    }),

  openClearConversationModal: () =>
    set({
      clearConversationModal: {
        isOpen: true,
      },
    }),
  closeClearConversationModal: () =>
    set({
      clearConversationModal: {
        isOpen: false,
      },
    }),

  openDeleteConfirmation: (itemId: string, itemTitle: string, itemType: string) =>
    set({
      deleteConfirmationModal: {
        isOpen: true,
        itemId,
        itemTitle,
        itemType,
      },
    }),
  closeDeleteConfirmation: () =>
    set({
      deleteConfirmationModal: {
        isOpen: false,
        itemId: null,
        itemTitle: '',
        itemType: '',
      },
    }),

  resetAllModals: () =>
    set({
      // Bot Group modals
      botGroupFormModal: {
        isOpen: false,
        botGroup: null,
        mode: 'create',
      },
      deleteBotGroupModal: {
        isOpen: false,
        botGroup: null,
      },
      // Bot modals
      botFormModal: {
        isOpen: false,
        bot: null,
        botGroupId: null,
        mode: 'create',
      },
      deleteBotModal: {
        isOpen: false,
        bot: null,
        botGroupId: null,
      },
      clearConversationModal: {
        isOpen: false,
      },
      deleteConfirmationModal: {
        isOpen: false,
        itemId: null,
        itemTitle: '',
        itemType: '',
      },
    }),
}));
