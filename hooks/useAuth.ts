import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'; 

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export interface User {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  roleApproved: boolean;
  gender: 'male' | 'female';
  location: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        // Verify token with backend
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${base_url}/auth/verify`);
          
          setAuthState({
            user: response.data.user || user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear storage
          await logout();
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store credentials securely
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // Navigate to appropriate screen based on user role
      if (user.role === 'doctor') {
        router.replace('/doctor/dashboard');
      } else {
        router.replace('/(tabs)');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'patient' | 'doctor';
  }) => {
    try {
      // 10.21.18.10
      const response = await axios.post(`${base_url}/auth/register`
        , {
        ...userData,
        role: userData.role || 'patient',
      });

      const { token, user } = response.data;

      // Store credentials securely
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // Navigate to appropriate screen
      if (user.role === 'doctor') {
        router.replace('/doctor/dashboard');
      } else {
        router.replace('/(tabs)');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      // Clear stored credentials
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');

      // Clear axios header
      delete axios.defaults.headers.common['Authorization'];

      // Update state
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Navigate to auth screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await axios.put(`${base_url}/auth/profile`, userData);
      
      const updatedUser = { ...authState.user, ...response.data.user };
      
      // Update stored user data
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      
      // Update state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/forgot-password`, { email });
      return { 
        success: true, 
        message: response.data.message,
        email: response.data.email // For display in OTP screen
      };
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send verification code',
      };
    }
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/verify-reset-otp`, { 
        email, 
        otp 
      });
      return { 
        success: true, 
        resetToken: response.data.resetToken,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid verification code',
      };
    }
  };


  const resetPassword = async (resetToken: string, password: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/reset-password`, { 
        resetToken, 
        password 
      });
      
      // Auto-login after successful password reset
      const { token, user } = response.data;
      await AsyncStorage.setItem('authToken', token);
      setAuthState(prev => ({
        ...prev,
        token,
        user,
        isAuthenticated: true,
      }));

      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password',
      };
    }
  };

  const resendResetOTP = async (email: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/resend-reset-otp`, { email });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error('Resend OTP failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend verification code',
      };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/verify-otp`, {
        email,
        otp,
      });

      const { token, user } = response.data;

      // Store credentials securely
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    verifyResetOTP,
    resendResetOTP,
    verifyOTP,
    checkAuthStatus,
  };
};