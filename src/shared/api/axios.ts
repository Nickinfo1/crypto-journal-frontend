import axios, { AxiosError, type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Здесь можно добавить глобальную обработку ошибок (toast уведомления)
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;