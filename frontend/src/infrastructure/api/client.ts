import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { env } from '@/shared/config/env';
import { ApiError as ApiErrorClass, ApiErrorResponse } from '@/shared/utils/api-error';

// API Error type (for backwards compatibility)
export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed in future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Log error in development
    if (import.meta.env.DEV) {
      if (error.response) {
        const { status, data } = error.response;
        console.error(`[API Error ${status}]:`, data);
      } else if (error.request) {
        console.error('[Network Error]: No response received', error.code);
      } else {
        console.error('[Request Error]:', error.message);
      }
    }

    // Transform to ApiError for consistent error handling
    const apiError = ApiErrorClass.fromAxiosError(error);

    return Promise.reject(apiError);
  }
);

export default apiClient;
