// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a base instance
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.socraticbooks.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      const { access } = JSON.parse(tokens);
      if (access && config.headers) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to refresh token when it expires
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get the refresh token
        const tokens = localStorage.getItem('auth_tokens');
        if (!tokens) {
          throw new Error('No refresh token available');
        }
        
        const { refresh } = JSON.parse(tokens);
        
        // Try to get a new access token
        const response = await axios.post(
          'https://api.socraticbooks.com/api/users/token/refresh/',
          { refresh }
        );
        
        // If successful, update the tokens in storage
        const newTokens = {
          access: response.data.access,
          refresh: response.data.refresh || refresh,
        };
        
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('auth_tokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => api.get(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => api.post(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => api.put(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => api.delete(url, config),
};

export default apiService;
