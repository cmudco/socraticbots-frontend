import axios, { AxiosRequestConfig } from 'axios';
import { getErrorMessage } from './errorHandler';
import { METHOD } from '../constants/requests';
import config from '../lib/config';

const BASE_URL = config.apiUrl;

interface BaseRequestParams {
  url: string;
  method?: METHOD;
  data?: object | FormData;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  includeAuthToken?: boolean;
}

export const baseRequest = async <T>({
  url,
  method = METHOD.GET,
  data,
  headers = {},
  params,
  includeAuthToken = true,
}: BaseRequestParams): Promise<T> => {
  const axiosOptions: AxiosRequestConfig = {
    url: `${BASE_URL}/${url}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    params,
    data,
  };

  if (includeAuthToken) {
    try {
      // Get token from localStorage (simpler than Zustand for this use case)
      const authToken = localStorage.getItem('access_token');
      
      if (authToken) {
        axiosOptions.headers = {
          ...axiosOptions.headers,
          Authorization: `Bearer ${authToken}`,
        };
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      throw new Error('Authentication error');
    }
  }

  try {
    const response = await axios(axiosOptions);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}; 