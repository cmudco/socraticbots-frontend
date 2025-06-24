// Environment configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.socraticbooks.com/api',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags (can be expanded later)
  features: {
    enableDevtools: import.meta.env.DEV,
  },
} as const

export default config
