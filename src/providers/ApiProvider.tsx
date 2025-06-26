// src/providers/ApiProvider.tsx
import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/instance';
import { useAuthStore } from '../stores/authStore';
import { useRefreshToken } from '../hooks/queries/useAuth';

interface ApiProviderProps {
    children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { clearAuth } = useAuthStore();
    const refreshTokenMutation = useRefreshToken();
    const refreshAttemptRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Request interceptor to add auth token
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                // Get the latest token from Zustand store
                const currentTokens = useAuthStore.getState().tokens;

                if (currentTokens?.access && config.headers) {
                    config.headers.Authorization = `Bearer ${currentTokens.access}`;
                    console.log('Adding auth header to request:', config.url);
                } else {
                    console.log('No auth token available for request:', config.url);
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

                    const currentTokens = useAuthStore.getState().tokens;

                    if (currentTokens?.refresh) {
                        // Create a unique key for this refresh token to avoid duplicate attempts
                        const refreshKey = currentTokens.refresh.substring(0, 20);

                        // Check if we've already attempted to refresh this token
                        if (refreshAttemptRef.current.has(refreshKey)) {
                            console.log('Already attempted refresh for this token, clearing auth');
                            clearAuth();
                            return Promise.reject(error);
                        }

                        // Mark this token as being refreshed
                        refreshAttemptRef.current.add(refreshKey);

                        try {
                            // Use the mutation to refresh the token
                            await refreshTokenMutation.mutateAsync(currentTokens.refresh);

                            console.log('Token refresh successful, retrying request');

                            // Get the new token from the store
                            const newTokens = useAuthStore.getState().tokens;
                            if (newTokens?.access && originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
                            }

                            // Remove from attempted set since it succeeded
                            refreshAttemptRef.current.delete(refreshKey);

                            // Retry the original request
                            return api(originalRequest);

                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);

                            // Remove from attempted set on failure
                            refreshAttemptRef.current.delete(refreshKey);

                            // Clear auth state on refresh failure
                            clearAuth();

                            return Promise.reject(error);
                        }
                    } else {
                        console.log('No refresh token available');
                        clearAuth();
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [clearAuth, refreshTokenMutation, queryClient]);

    return <>{children}</>;
};
