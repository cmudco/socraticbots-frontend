import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()(set => ({
  toasts: [],
  addToast: toast => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set(state => ({ toasts: [...state.toasts, { id, ...toast }] }));
    return id;
  },
  removeToast: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
