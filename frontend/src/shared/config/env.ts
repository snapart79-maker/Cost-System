// Environment configuration
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  APP_NAME: 'Wire Harness Cost Management',
  VERSION: '1.0.0',
} as const;
