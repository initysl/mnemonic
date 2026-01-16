import { ApiError, ApiErrorResponse } from '@/types/mtype';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { getAuthToken } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (config.headers) {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(normalizeApiError(error));
  }
);

function normalizeApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.response) {
    return {
      status: error.response.status,
      message:
        error.response.data?.message ||
        (typeof error.response.data?.detail === 'string'
          ? error.response.data.detail
          : 'Request failed'),
      details: error.response.data?.detail,
    };
  }

  if (error.request) {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
    };
  }

  return {
    status: 0,
    message: error.message || 'Unexpected error occurred',
  };
}
