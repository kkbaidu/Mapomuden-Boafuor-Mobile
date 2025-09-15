import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const base_url =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  roleApproved: boolean;
  gender: "male" | "female" | "";
  location: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodGroup: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  // Helper to normalize backend user shape (backend returns id but frontend expects _id)
  const normalizeUser = (u: any) => {
    if (!u) return u;
    const _id = u._id || u.id || u.userId; // fallback chain
    return { ...u, _id };
  };

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
      const token = await SecureStore.getItemAsync("token");
      const userStr = await SecureStore.getItemAsync("user");

      if (token && userStr) {
        const storedUser = normalizeUser(JSON.parse(userStr));

        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          // Use existing backend route /auth/user (no /auth/verify endpoint available)
          const response = await axios.get(`${base_url}/auth/user`);
          const refreshedUser = normalizeUser(response.data);

          setAuthState({
            user: refreshedUser || storedUser,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          // Fall back to stored user if token works locally, else logout
          if (storedUser && storedUser._id) {
            setAuthState({
              user: storedUser,
              token,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            await logout();
          }
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
      console.error("Auth check failed:", error);
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
      const normalized = normalizeUser(user);

      // Store credentials securely
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(normalized));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user: normalized,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // Navigate to appropriate screen based on user role
      if (normalized.role === "doctor") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/(tabs)");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "patient" | "doctor";
  }) => {
    try {
      const response = await axios.post(`${base_url}/auth/register`, {
        ...userData,
        role: userData.role || "patient",
      });
      const { token, user } = response.data;
      const normalized = normalizeUser(user);

      // Store credentials securely
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(normalized));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user: normalized,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // Navigate to appropriate screen
      if (normalized.role === "doctor") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/(tabs)");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      // Clear stored credentials
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");

      // Clear axios header
      delete axios.defaults.headers.common["Authorization"];

      // Update state
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Navigate to auth screen
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await axios.put(`${base_url}/auth/user`, userData);
      const updatedUser = normalizeUser(response.data.user);

      // Update stored user data
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));

      // Update state
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true };
    } catch (error: any) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/forgot-password`, {
        email,
      });
      return {
        success: true,
        message: response.data.message,
        email: response.data.email, // For display in OTP screen
      };
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to send verification code",
      };
    }
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/verify-reset-otp`, {
        email,
        otp,
      });
      return {
        success: true,
        resetToken: response.data.resetToken,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Invalid verification code",
      };
    }
  };

  const resetPassword = async (resetToken: string, password: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/reset-password`, {
        resetToken,
        password,
      });
      const { token, user } = response.data;
      const normalized = normalizeUser(user);

      // Auto-login after successful password reset
      await AsyncStorage.setItem("authToken", token);
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(normalized));

      setAuthState((prev) => ({
        ...prev,
        token,
        user: normalized,
        isAuthenticated: true,
      }));

      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error("Password reset failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password",
      };
    }
  };

  const resendResetOTP = async (email: string) => {
    try {
      const response = await axios.post(`${base_url}/auth/resend-reset-otp`, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to resend verification code",
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
      const normalized = normalizeUser(user);

      // Store credentials securely
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(normalized));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setAuthState({
        user: normalized,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${base_url}/auth/user`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      const normalized = normalizeUser(response?.data);

      setAuthState((prev) => ({
        ...prev,
        user: normalized,
      }));
    } catch (error) {
      console.error("Failed to fetch user:", error);
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
    fetchUser,
  };
};
