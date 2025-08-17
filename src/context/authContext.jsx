// context/authContext.js - UPDATED WITH AXIOS & ENV VARIABLES
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_BASE_URL ||  'http://localhost:5000/api',
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskflow-token') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('taskflow-refresh-token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add token to axios requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Axios response interceptor for handling token refresh
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (refreshToken) {
            try {
              const response = await api.post('/auth/refresh', {
                refreshToken: refreshToken
              });
              
              const newToken = response.data.data.accessToken;
              setToken(newToken);
              localStorage.setItem('taskflow-token', newToken);
              
              // Update the failed request with new token and retry
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              clearAuth();
              return Promise.reject(refreshError);
            }
          } else {
            clearAuth();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear all auth data
  const clearAuth = () => {
    setUser(null);
    setToken('');
    setRefreshToken('');
    localStorage.removeItem('taskflow-token');
    localStorage.removeItem('taskflow-refresh-token');
    setError(null);
    delete api.defaults.headers.common['Authorization'];
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Store tokens and user data
      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(user);
      
      localStorage.setItem('taskflow-token', accessToken);
      localStorage.setItem('taskflow-refresh-token', newRefreshToken);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });

      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Store tokens and user data
      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(user);
      
      localStorage.setItem('taskflow-token', accessToken);
      localStorage.setItem('taskflow-refresh-token', newRefreshToken);

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/auth/profile', profileData);
      
      setUser(response.data.data.user);
      return { success: true, user: response.data.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await api.put('/auth/password', {
        currentPassword,
        newPassword
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,

    // Utilities
    clearAuth,
    api // Export api instance for use in other parts of the app
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
