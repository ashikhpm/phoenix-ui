// Authentication Types

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  isActive: boolean;
  inactiveDate: string | null;
  joiningDate: string | null;
  userRoleId: number;
  userRole: {
    id: number;
    name: string;
    description: string;
    users: any[];
  };
  attendances: any[];
  meetingPayments: any[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// API Service Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 