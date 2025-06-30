import { create } from 'zustand';

interface FormErrors {
  [key: string]: string;
}

interface BookFormData {
  title: string;
  description: string;
  errors: FormErrors;
}

interface LoginFormData {
  username: string;
  password: string;
  errors: FormErrors;
}

interface FormStoreState {
  // Book form
  bookForm: BookFormData;
  setBookFormField: (field: keyof Omit<BookFormData, 'errors'>, value: string) => void;
  setBookFormError: (field: string, error: string) => void;
  clearBookFormErrors: () => void;
  resetBookForm: () => void;
  setBookFormData: (data: Partial<BookFormData>) => void;

  // Login form
  loginForm: LoginFormData;
  setLoginFormField: (field: keyof Omit<LoginFormData, 'errors'>, value: string) => void;
  setLoginFormError: (field: string, error: string) => void;
  clearLoginFormErrors: () => void;
  resetLoginForm: () => void;
  setLoginFormData: (data: Partial<LoginFormData>) => void;

  // Global form utilities
  resetAllForms: () => void;
}

export const useFormStore = create<FormStoreState>(set => ({
  // Book form initial state
  bookForm: {
    title: '',
    description: '',
    errors: {},
  },

  // Login form initial state
  loginForm: {
    username: '',
    password: '',
    errors: {},
  },

  // Book form actions
  setBookFormField: (field, value) =>
    set(state => ({
      bookForm: {
        ...state.bookForm,
        [field]: value,
        // Clear error for this field when user starts typing
        errors: {
          ...state.bookForm.errors,
          [field]: '',
        },
      },
    })),

  setBookFormError: (field, error) =>
    set(state => ({
      bookForm: {
        ...state.bookForm,
        errors: {
          ...state.bookForm.errors,
          [field]: error,
        },
      },
    })),

  clearBookFormErrors: () =>
    set(state => ({
      bookForm: {
        ...state.bookForm,
        errors: {},
      },
    })),

  resetBookForm: () =>
    set({
      bookForm: {
        title: '',
        description: '',
        errors: {},
      },
    }),

  setBookFormData: data =>
    set(state => ({
      bookForm: {
        ...state.bookForm,
        ...data,
        errors: data.errors || state.bookForm.errors,
      },
    })),

  // Login form actions
  setLoginFormField: (field, value) =>
    set(state => ({
      loginForm: {
        ...state.loginForm,
        [field]: value,
        // Clear error for this field when user starts typing
        errors: {
          ...state.loginForm.errors,
          [field]: '',
        },
      },
    })),

  setLoginFormError: (field, error) =>
    set(state => ({
      loginForm: {
        ...state.loginForm,
        errors: {
          ...state.loginForm.errors,
          [field]: error,
        },
      },
    })),

  clearLoginFormErrors: () =>
    set(state => ({
      loginForm: {
        ...state.loginForm,
        errors: {},
      },
    })),

  resetLoginForm: () =>
    set({
      loginForm: {
        username: '',
        password: '',
        errors: {},
      },
    }),

  setLoginFormData: data =>
    set(state => ({
      loginForm: {
        ...state.loginForm,
        ...data,
      },
    })),

  // Global utilities
  resetAllForms: () =>
    set({
      bookForm: {
        title: '',
        description: '',
        errors: {},
      },
      loginForm: {
        username: '',
        password: '',
        errors: {},
      },
    }),
}));