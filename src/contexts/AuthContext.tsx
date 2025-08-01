import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { authService } from '../services/api';
import { User } from '../types/common';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have a valid JWT token
  const isAuthenticated = useMemo(() => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting login...');
      const response = await authService.login({ username, password });
      
      console.log('Login successful, storing token...');
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      // Set user data
      setUser(response.user);
      console.log('User data set, navigating to members page...');

      // Navigate to dashboard - use setTimeout to ensure state updates first
      setTimeout(() => {
        console.log('Setting hash to #dashboard...');
        window.location.hash = '#dashboard';
        // Force a hash change event
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        console.log('Navigation complete');
      }, 100);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Even if logout API fails, we should still clear local state
      console.error('Logout API error:', err);
    } finally {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear local state
      setUser(null);
      
      // Navigate to login page
      window.location.hash = '#login';
      
      // Force a hash change event to trigger navigation
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Try to fetch user data to validate the token
          const response = await authService.getCurrentUser();
          setUser(response);
          console.log('User data fetched successfully');
        } catch (err: any) {
          console.error('Failed to fetch user data:', err);
          // Only clear token if it's a 401 error (unauthorized)
          // For other errors (like network issues or endpoint not found), keep the token
          if (err.response?.status === 401) {
            localStorage.removeItem('authToken');
            setUser(null);
          } else {
            // For other errors (404, 500, network issues), assume token is still valid
            console.log('Non-401 error, keeping token for now. Error status:', err.response?.status);
            // Don't clear the token for non-401 errors
          }
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    clearError,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 