import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/signup",
        values
      );

      const { token, user } = response.data;

      // Store the token securely (e.g., SecureStore)
      console.log("Token: " + token);
      await SecureStore.setItemAsync("token", token);

      // Redirect to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 px-6 pt-16">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="medical" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Sign in to access your healthcare assistant
            </Text>
          </View>

          {/* Formik Login Form */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View className="space-y-6">
                {/* Email Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white pr-12"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </Text>
                  )}
                </View>

                {/* Forgot Password Link */}
                <View className="items-end">
                  <Link href="/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text className="text-sm text-blue-600 font-medium">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg items-center justify-center ${
                    isLoading ? "bg-blue-300" : "bg-blue-600"
                  }`}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold mr-2">
                        Signing In...
                      </Text>
                      <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </View>
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          {/* Sign Up Link & Emergency Access remain unchanged */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
