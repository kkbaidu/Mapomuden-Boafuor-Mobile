import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Add your login logic here
      // await loginUser(email, password);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
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

          {/* Login Form */}
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  className="absolute right-3 top-3"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-12"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
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

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-sm text-gray-500">OR</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login Buttons */}
            <View className="space-y-3">
              <TouchableOpacity className="w-full py-3 border border-gray-300 rounded-lg flex-row items-center justify-center">
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-full py-3 border border-gray-300 rounded-lg flex-row items-center justify-center">
                <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                <Text className="ml-2 text-gray-700 font-medium">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-8 mb-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Emergency Access */}
          <TouchableOpacity className="items-center py-4 border-t border-gray-200">
            <Text className="text-red-600 font-medium">
              Emergency Access (No Account Required)
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Access basic health information
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
