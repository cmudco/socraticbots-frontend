export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.socraticbooks.com/api',

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  features: {
    enableDevtools: import.meta.env.DEV,
  },
} as const;

export default config;
