// Formik + Yup utilities for form handling
import { useFormik } from 'formik'
import * as yup from 'yup'

// Common validation schemas
export const authSchemas = {
  login: yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  }),

  register: yup.object({
    username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  }),
}

export const bookSchemas = {
  createBook: yup.object({
    title: yup.string().min(1, 'Title is required').required('Title is required'),
    description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  }),

  createChapter: yup.object({
    title: yup.string().min(1, 'Title is required').required('Title is required'),
    subject: yup.string().min(1, 'Subject is required').required('Subject is required'),
    topic: yup.string().min(1, 'Topic is required').required('Topic is required'),
    greeting: yup.string().optional(),
    chat_prompt: yup.string().optional(),
    tracking_prompt: yup.string().optional(),
    learning_goals: yup.string().optional(),
    chat_model_id: yup.string().optional(),
    tracking_model_id: yup.string().optional(),
  }),
}

// Custom hook for form handling with Formik + Yup + Shadcn
export function useCustomForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: yup.ObjectSchema<T>,
  onSubmit: (values: T) => void | Promise<void>
) {
  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  })
}
