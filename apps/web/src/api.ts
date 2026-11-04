import { createFinanceApiClient } from '@finance/api-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = createFinanceApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },
  onUnauthorized: () => {
    console.warn('Session expired or unauthorized request detected.');
  }
});

