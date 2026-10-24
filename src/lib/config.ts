export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  features: {
    enableDevtools: import.meta.env.DEV,
  },
} as const;

export default config;
