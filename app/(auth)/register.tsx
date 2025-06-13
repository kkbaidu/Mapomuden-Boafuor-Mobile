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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (!acceptTerms) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Add your registration logic here
      // await registerUser(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Registration Successful",
        "Please check your email to verify your account",
        [
          {
            text: "OK",
            onPress: () => router.push("/verify-otp"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Registration Failed", "Please try again");
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
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-0 top-0 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Join our healthcare community
            </Text>
          </View>

          {/* Registration Form */}
          <View className="space-y-4">
            {/* Name Fields */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  First Name
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500"
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData("firstName", value)}
                  autoCapitalize="words"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500"
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData("lastName", value)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => updateFormData("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  className="absolute right-3 top-3"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500"
                  placeholder="+233 XX XXX XXXX"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData("phone", value)}
                  keyboardType="phone-pad"
                />
                <Ionicons
                  name="call-outline"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 pr-12"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => updateFormData("password", value)}
                  secureTextEntry={!showPassword}
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

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    updateFormData("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3"
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View className="flex-row items-start space-x-3 mt-4">
              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${
                  acceptTerms
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {acceptTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 leading-5">
                  I agree to the{" "}
                  <Text className="text-blue-600 underline">
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text className="text-blue-600 underline">
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg items-center justify-center mt-6 ${
                isLoading ? "bg-green-300" : "bg-green-600"
              }`}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold mr-2">
                    Creating Account...
                  </Text>
                  <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </View>
              ) : (
                <Text className="text-white text-base font-semibold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center mt-8 mb-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
