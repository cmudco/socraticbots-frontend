import axios, { AxiosError } from 'axios';

interface DjangoErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<DjangoErrorResponse>;

    if (!axiosError.response) {
      return 'Network error. Please check your internet connection.';
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    if (data) {
      if (typeof data.message === 'string') {
        return data.message;
      }

      if (typeof data.detail === 'string') {
        return data.detail;
      }

      if (typeof data.error === 'string') {
        return data.error;
      }

      if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        return data.non_field_errors[0];
      }

      const fieldErrors = Object.keys(data).find(
        key =>
          key !== 'message' && key !== 'error' && key !== 'detail' && key !== 'non_field_errors'
      );
      if (fieldErrors && Array.isArray(data[fieldErrors])) {
        const fieldErrorArray = data[fieldErrors] as string[];
        return `${fieldErrors}: ${fieldErrorArray[0]}`;
      }
    }

    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
