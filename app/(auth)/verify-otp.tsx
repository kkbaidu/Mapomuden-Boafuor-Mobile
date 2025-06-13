import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // Email from previous screen (in real app, this would come from navigation params)
  const email = "user@example.com";

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      // Add your OTP verification logic here
      // await verifyOTP(otpString);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        "Verification Successful",
        "Your account has been verified successfully!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Verification Failed", "Invalid code. Please try again.");
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Add your resend OTP logic here
      // await resendOTP(email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "New verification code sent!");
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
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

            <View className="w-20 h-20 bg-purple-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="shield-checkmark" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Account
            </Text>
            <Text className="text-base text-gray-600 text-center px-4">
              We've sent a 6-digit verification code to
            </Text>
            <Text className="text-base font-semibold text-gray-900 mt-1">
              {email}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-700 mb-4 text-center">
              Enter the 6-digit code
            </Text>
            <View className="flex-row justify-between space-x-2">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref!) as any}
                  className={`w-12 h-14 border-2 rounded-lg text-center text-xl font-bold ${
                    digit ? "border-purple-500 bg-purple-50" : "border-gray-300"
                  } focus:border-purple-500`}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerifyOTP}
            disabled={isLoading || otp.join("").length !== 6}
            className={`w-full py-3 rounded-lg items-center justify-center mb-6 ${
              isLoading || otp.join("").length !== 6
                ? "bg-gray-300"
                : "bg-purple-600"
            }`}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <Text className="text-white font-semibold mr-2">
                  Verifying...
                </Text>
                <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </View>
            ) : (
              <Text className="text-white text-base font-semibold">
                Verify Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View className="items-center mb-8">
            <Text className="text-sm text-gray-600 mb-4">
              Didn't receive the code?
            </Text>

            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isLoading}
                className="py-2 px-4"
              >
                <Text className="text-purple-600 font-semibold">
                  Resend Code
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500 ml-1">
                  Resend in {resendTimer}s
                </Text>
              </View>
            )}
          </View>

          {/* Alternative Verification Methods */}
          <View className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Having trouble?
            </Text>
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center py-2">
                <Ionicons name="call-outline" size={20} color="#059669" />
                <Text className="ml-3 text-gray-700">
                  Get code via SMS instead
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-2">
                <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                <Text className="ml-3 text-gray-700">Contact support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#3B82F6"
              />
              <View className="ml-3 flex-1">
                <Text className="text-blue-800 font-medium mb-1">
                  Security Notice
                </Text>
                <Text className="text-blue-700 text-sm leading-5">
                  This code will expire in 10 minutes. Never share your
                  verification code with anyone.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-8 mb-6">
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="items-center py-4"
            >
              <Text className="text-gray-600">
                Wrong email address?{" "}
                <Text className="text-purple-600 font-semibold">
                  Go back to login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
