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
  email: string;
  password: string;
  errors: FormErrors;
}

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string;
  errors: FormErrors;
}

interface FormStoreState {
  bookForm: BookFormData;
  setBookFormField: (field: keyof Omit<BookFormData, 'errors'>, value: string) => void;
  setBookFormError: (field: string, error: string) => void;
  clearBookFormErrors: () => void;
  resetBookForm: () => void;
  setBookFormData: (data: Partial<BookFormData>) => void;

  loginForm: LoginFormData;
  setLoginFormField: (field: keyof Omit<LoginFormData, 'errors'>, value: string) => void;
  setLoginFormError: (field: string, error: string) => void;
  clearLoginFormErrors: () => void;
  resetLoginForm: () => void;
  setLoginFormData: (data: Partial<LoginFormData>) => void;

  registrationForm: RegistrationFormData;
  setRegistrationFormField: (
    field: keyof Omit<RegistrationFormData, 'errors'>,
    value: string
  ) => void;
  setRegistrationFormError: (field: string, error: string) => void;
  clearRegistrationFormErrors: () => void;
  resetRegistrationForm: () => void;
  setRegistrationFormData: (data: Partial<RegistrationFormData>) => void;

  resetAllForms: () => void;
}

export const useFormStore = create<FormStoreState>(set => ({
  bookForm: {
    title: '',
    description: '',
    errors: {},
  },

  loginForm: {
    email: '',
    password: '',
    errors: {},
  },

  registrationForm: {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    access_code: '',
    errors: {},
  },

  setBookFormField: (field, value) =>
    set(state => ({
      bookForm: {
        ...state.bookForm,
        [field]: value,
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

  setLoginFormField: (field, value) =>
    set(state => ({
      loginForm: {
        ...state.loginForm,
        [field]: value,
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
        email: '',
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

  setRegistrationFormField: (field, value) =>
    set(state => ({
      registrationForm: {
        ...state.registrationForm,
        [field]: value,
        errors: {
          ...state.registrationForm.errors,
          [field]: '',
        },
      },
    })),

  setRegistrationFormError: (field, error) =>
    set(state => ({
      registrationForm: {
        ...state.registrationForm,
        errors: {
          ...state.registrationForm.errors,
          [field]: error,
        },
      },
    })),

  clearRegistrationFormErrors: () =>
    set(state => ({
      registrationForm: {
        ...state.registrationForm,
        errors: {},
      },
    })),

  resetRegistrationForm: () =>
    set({
      registrationForm: {
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        access_code: '',
        errors: {},
      },
    }),

  setRegistrationFormData: data =>
    set(state => ({
      registrationForm: {
        ...state.registrationForm,
        ...data,
        errors: data.errors || state.registrationForm.errors,
      },
    })),

  resetAllForms: () =>
    set({
      bookForm: {
        title: '',
        description: '',
        errors: {},
      },
      loginForm: {
        email: '',
        password: '',
        errors: {},
      },
      registrationForm: {
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        access_code: '',
        errors: {},
      },
    }),
}));
