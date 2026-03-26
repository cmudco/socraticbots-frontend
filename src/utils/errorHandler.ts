import axios, { AxiosError } from 'axios';

interface DjangoErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

/**
 * Converts camelCase field names to human-readable labels
 * e.g., "chatModelDareId" -> "Chat Model Dare Id"
 */
const prettifyFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extracts and formats all field errors from Django response
 * Returns a formatted string with all errors
 */
const formatFieldErrors = (data: DjangoErrorResponse): string | null => {
  const errorFields = Object.keys(data).filter(
    key =>
      key !== 'message' &&
      key !== 'error' &&
      key !== 'detail' &&
      key !== 'non_field_errors' &&
      Array.isArray(data[key])
  );

  if (errorFields.length === 0) return null;

  // Format each field error
  const formattedErrors = errorFields.map(field => {
    const fieldErrors = data[field] as string[];
    const prettyFieldName = prettifyFieldName(field);
    return `${prettyFieldName}: ${fieldErrors[0]}`;
  });

  // Join multiple errors with newlines or semicolons based on count
  if (formattedErrors.length === 1) {
    return formattedErrors[0];
  }

  return formattedErrors.join('; ');
};

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

      // Handle field-specific errors with prettified field names
      const fieldErrorMessage = formatFieldErrors(data);
      if (fieldErrorMessage) {
        return fieldErrorMessage;
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
