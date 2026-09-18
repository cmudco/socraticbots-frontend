import { create } from 'zustand';

import { describeRejections, readImageFiles } from '@/utils/chatImages';
import { toast } from '@/utils/toast';

import { type AttachedImage, MAX_ATTACHED_IMAGES } from '@/types/chatAttachments';

interface ChatAttachmentState {
  images: AttachedImage[];
  attach: (files: File[]) => Promise<void>;
  remove: (id: string) => void;
  clear: () => void;
}

/**
 * Images staged for the next chat turn. One store serves both the
 * authenticated and the public chat: only one composer is mounted at a time.
 */
export const useChatAttachmentStore = create<ChatAttachmentState>((set, get) => ({
  images: [],

  attach: async files => {
    const room = MAX_ATTACHED_IMAGES - get().images.length;
    const { images, rejected } = await readImageFiles(files, Math.max(room, 0));
    if (images.length > 0) {
      set(state => ({ images: [...state.images, ...images] }));
    }
    const notice = describeRejections(rejected);
    if (notice) toast.error(notice);
  },

  remove: id => set(state => ({ images: state.images.filter(image => image.id !== id) })),

  clear: () => set({ images: [] }),
}));

export const useAttachedImages = () => useChatAttachmentStore(state => state.images);
