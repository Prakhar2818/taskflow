// context/authContext.js - FIXED VERSION WITH PROPER TOKEN REFRESH
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// ✅ Request queue to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Configure axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('taskflow-token') || '');
  const [refreshToken, setRefreshTokenState] = useState(localStorage.getItem('taskflow-refresh-token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Centralized token update function
  const updateToken = (newToken) => {
    console.log('📝 Updating token:', newToken ? 'New token received' : 'Clearing token');
    
    setTokenState(newToken);
    localStorage.setItem('taskflow-token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const updateRefreshToken = (newRefreshToken) => {
    setRefreshTokenState(newRefreshToken);
    localStorage.setItem('taskflow-refresh-token', newRefreshToken);
  };

  // ✅ Set initial token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ✅ IMPROVED: Response interceptor with proper queue management
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // ✅ Add to queue if already refreshing
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          console.log('🔄 Token expired, attempting refresh...');
          originalRequest._retry = true;
          isRefreshing = true;

          if (refreshToken) {
            try {
              const response = await api.post('/auth/refresh', {
                refreshToken: refreshToken
              });
              
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              
              console.log('✅ Token refreshed successfully');
              
              // ✅ Update token in all places
              updateToken(accessToken);
              if (newRefreshToken) {
                updateRefreshToken(newRefreshToken);
              }
              
              // ✅ Process queued requests
              processQueue(null, accessToken);
              
              // ✅ Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
              return api(originalRequest);
              
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              
              // ✅ Process queue with error
              processQueue(refreshError, null);
              
              // ✅ Clear auth and redirect
              clearAuth();
              
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            console.log('⚠️ No refresh token available');
            clearAuth();
            return Promise.reject(error);
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
          console.log('🔍 Verifying stored token...');
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
          console.log('✅ User authenticated');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Clear all auth data
  const clearAuth = () => {
    console.log('🧹 Clearing authentication data');
    
    setUser(null);
    setTokenState('');
    setRefreshTokenState('');
    localStorage.removeItem('taskflow-token');
    localStorage.removeItem('taskflow-refresh-token');
    setError(null);
    delete api.defaults.headers.common['Authorization'];
    
    // ✅ Clear any pending refresh operations
    isRefreshing = false;
    failedQueue = [];
  };

  // ✅ Login function
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Attempting login...');
      
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

      console.log('✅ Login successful');

      // ✅ Update tokens using centralized functions
      updateToken(accessToken);
      updateRefreshToken(newRefreshToken);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error);
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

      const { user } = response.data.data;
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
    api
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
