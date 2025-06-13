import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Add your password reset logic here
      // await sendPasswordResetEmail(email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailSent(true);
    } catch (error) {
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // Resend logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Reset email sent again!");
    } catch (error) {
      Alert.alert("Error", "Failed to resend email");
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

            <View className="w-20 h-20 bg-orange-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {emailSent ? "Check Your Email" : "Forgot Password?"}
            </Text>
            <Text className="text-base text-gray-600 text-center px-4">
              {emailSent
                ? "We have sent a password reset link to your email address"
                : "Do not worry! Enter your email and we'll send you a reset link"}
            </Text>
          </View>

          {!emailSent ? (
            <>
              {/* Email Input Form */}
              <View className="space-y-6">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your email address"
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

                {/* Reset Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg items-center justify-center ${
                    isLoading ? "bg-orange-300" : "bg-orange-600"
                  }`}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold mr-2">
                        Sending...
                      </Text>
                      <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </View>
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Send Reset Link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Alternative Options */}
              <View className="mt-8 space-y-4">
                <View className="flex-row items-center">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="px-4 text-sm text-gray-500">OR</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity className="w-full py-3 border border-gray-300 rounded-lg flex-row items-center justify-center">
                  <Ionicons name="call-outline" size={20} color="#059669" />
                  <Text className="ml-2 text-gray-700 font-medium">
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Email Sent Success State */}
              <View className="space-y-6">
                {/* Email Display */}
                <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#059669"
                    />
                    <Text className="ml-2 text-green-800 font-medium">
                      Reset link sent to:
                    </Text>
                  </View>
                  <Text className="text-green-700 mt-1 font-semibold">
                    {email}
                  </Text>
                </View>

                {/* Instructions */}
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Text className="text-blue-800 font-medium mb-2">
                    {"What's next?"}
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-start">
                      <View className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3" />
                      <Text className="text-blue-700 flex-1">
                        Check your email inbox (and spam folder)
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <View className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3" />
                      <Text className="text-blue-700 flex-1">
                        Click the reset link in the email
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <View className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3" />
                      <Text className="text-blue-700 flex-1">
                        Create your new password
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    onPress={handleResendEmail}
                    disabled={isLoading}
                    className="w-full py-3 border border-orange-600 rounded-lg items-center justify-center"
                  >
                    <Text className="text-orange-600 text-base font-semibold">
                      Resend Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/login")}
                    className="w-full py-3 bg-gray-100 rounded-lg items-center justify-center"
                  >
                    <Text className="text-gray-700 text-base font-semibold">
                      Back to Sign In
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Timer Info */}
                <View className="items-center mt-4">
                  <Text className="text-sm text-gray-500 text-center">
                    Didn't receive the email? Check your spam folder or try
                    again in 2 minutes
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Help Section */}
          <View className="mt-12 mb-6">
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text className="ml-2 text-gray-700 font-medium">
                  Need Help?
                </Text>
              </View>
              <Text className="text-sm text-gray-600 mb-3">
                If you're having trouble resetting your password, our support
                team is here to help.
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={16} color="#3B82F6" />
                <Text className="ml-2 text-blue-600 font-medium">
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
