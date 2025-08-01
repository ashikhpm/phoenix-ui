import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants';
import { User } from '../types/common';

// API configuration
const API_BASE_URL = 'http://localhost:5276';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login using hash routing
      localStorage.removeItem('authToken');
      window.location.hash = '#login';
    }
    return Promise.reject(error);
  }
);

// Generic API service class
export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // Generic GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Generic PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

// Auth-specific API service
export class AuthService extends ApiService {
  async login(credentials: { username: string; password: string }) {
    return this.post<{ token: string; user: any }>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string;
    confirmPassword?: string;
  }) {
    return this.post<{ token: string; user: any }>('/auth/register', userData);
  }

  async logout() {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getCurrentUser() {
    return this.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  async refreshToken() {
    return this.post<{ token: string }>('/auth/refresh');
  }
}

// Export singleton instances
export const apiService = new ApiService();
export const authService = new AuthService();

export default apiService; 