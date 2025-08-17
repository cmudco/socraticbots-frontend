import { useFormik } from 'formik';
import * as Yup from 'yup';

type FormFieldValue = string | number | boolean | null | undefined;
type FormValues = Record<
  string,
  FormFieldValue | FormFieldValue[] | Record<string, FormFieldValue>
>;

export const authSchemas = {
  login: Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  }),

  register: Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    access_code: Yup.string().optional(),
  }),
};

export const bookSchemas = {
  createBook: Yup.object({
    title: Yup.string().min(1, 'Title is required').required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required'),
  }),

  // createChapter removed - we use bot-based architecture now
};

export const bookValidationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(1, 'Title cannot be empty'),
  description: Yup.string().optional(),
});

// Temporarily disabled - will be rewritten for bots architecture
// export const chapterValidationSchema = Yup.object({
//   title: Yup.string().required('Title is required').min(1, 'Title cannot be empty'),
//   subject: Yup.string().required('Subject is required').min(1, 'Subject cannot be empty'),
//   topic: Yup.string().required('Topic is required').min(1, 'Topic cannot be empty'),
// });

export const userProfileValidationSchema = Yup.object({
  first_name: Yup.string().optional(),
  last_name: Yup.string().optional(),
  email: Yup.string().email('Invalid email format').required('Email is required'),
});

export const changePasswordValidationSchema = Yup.object({
  old_password: Yup.string().required('Current password is required'),
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const loginValidationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

export const learningGoalValidationSchema = Yup.object({
  title: Yup.string().required('Goal title is required').min(1, 'Title cannot be empty'),
  order: Yup.number().optional(),
});

// All old chapter-based schemas removed - we use bot-based architecture now

export function useCustomForm<T extends FormValues>(
  initialValues: T,
  validationSchema: Yup.ObjectSchema<T>,
  onSubmit: (values: T) => void | Promise<void>
) {
  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });
}

export const getFormValues = <T extends FormValues>(values: FormValues): T => {
  return values as T;
};
