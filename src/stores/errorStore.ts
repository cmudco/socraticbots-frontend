import { create } from 'zustand';

interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
  context?: string; // Which component/operation triggered the error
}

interface ErrorStoreState {
  errors: AppError[];

  // Actions
  addError: (message: string, type?: 'error' | 'warning' | 'info', context?: string) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  clearErrorsByContext: (context: string) => void;

  // Getters
  getErrorsByContext: (context: string) => AppError[];
  hasErrors: () => boolean;
  hasErrorsInContext: (context: string) => boolean;
}

export const useErrorStore = create<ErrorStoreState>((set, get) => ({
  errors: [],

  addError: (message: string, type = 'error', context) => {
    const error: AppError = {
      id: `error-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
      context,
    };

    set(state => ({
      errors: [...state.errors, error],
    }));

    // Auto-remove error after 5 seconds for non-critical errors
    if (type !== 'error') {
      setTimeout(() => {
        get().removeError(error.id);
      }, 5000);
    }
  },

  removeError: (id: string) => {
    set(state => ({
      errors: state.errors.filter(error => error.id !== id),
    }));
  },

  clearAllErrors: () => {
    set({ errors: [] });
  },

  clearErrorsByContext: (context: string) => {
    set(state => ({
      errors: state.errors.filter(error => error.context !== context),
    }));
  },

  getErrorsByContext: (context: string) => {
    return get().errors.filter(error => error.context === context);
  },

  hasErrors: () => {
    return get().errors.length > 0;
  },

  hasErrorsInContext: (context: string) => {
    return get().errors.some(error => error.context === context);
  },
}));