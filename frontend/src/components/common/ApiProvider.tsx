// src/components/common/ApiProvider.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api/instance';
import { useAppDispatch } from '../../store/hooks';
import { setApiReady, resetApiState } from '../../store/slices/apiSlice';

interface ApiProviderProps {
  children: React.ReactNode;
}

const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Reset API ready state when component mounts or auth changes
    dispatch(resetApiState());
    
    // Request interceptor to add auth token
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Always get the latest token from localStorage for each request
        const storedTokens = localStorage.getItem('auth_tokens');
        let accessToken = auth.tokens?.access;
        
        if (storedTokens) {
          const tokens = JSON.parse(storedTokens);
          accessToken = tokens.access; // Use the most up-to-date token
        }
        
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for token refresh
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('401 error detected, attempting to refresh token');
          originalRequest._retry = true;
          
          try {
            // Use auth context's refresh function
            const success = await auth.refreshToken();
            
            if (success) {
              console.log('Token refresh successful, retrying request');
              
              // Get the latest token from localStorage
              const storedTokens = localStorage.getItem('auth_tokens');
              if (storedTokens) {
                const tokens = JSON.parse(storedTokens);
                
                // Ensure we're using the very latest token
                if (originalRequest.headers) {
                  console.log('Using fresh token for retry:', tokens.access.substring(0, 10) + '...');
                  originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
                }
              }
              
              // Add a slight delay to ensure token propagation
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Create a fresh request rather than reusing the old one
              return api({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth_tokens') || '{}').access || ''}`
                }
              });
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Set API as ready with a delay to ensure auth is fully processed
    const readyTimer = setTimeout(() => {
      dispatch(setApiReady());
    }, 800); 
    
    // Clean up interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
      clearTimeout(readyTimer);
    };
  }, [auth, dispatch]);
  
  return <>{children}</>;
};

export default ApiProvider;
