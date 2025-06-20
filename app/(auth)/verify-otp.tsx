import { useAuthContext } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function VerifyResetOTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const { verifyResetOTP, resendResetOTP } = useAuthContext();
  const { email } = useLocalSearchParams<{ email: string }>();

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icon
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();

    // Timer for resend
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
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

    if (!email) {
      Alert.alert("Error", "Email address is missing");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyResetOTP(email, otpString);

      if (result.success) {
        router.push({
          pathname: "/(auth)/reset-password",
          params: { 
            resetToken: result.resetToken,
            email: email 
          }
        });
      } else {
        Alert.alert("Verification Failed", result.error || "Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;

    setIsLoading(true);
    try {
      const result = await resendResetOTP(email);

      if (result.success) {
        Alert.alert("Success", "New verification code sent to your email!");
        setResendTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert("Error", result.error || "Failed to resend code. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#1e40af', '#1e3a8a', '#059669']}
        style={styles.headerSection}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(15)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * 200,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.1, 0.3],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Header Content */}
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="shield-checkmark" size={40} color="white" />
          </Animated.View>
          
          <Text style={styles.headerTitle}>Verify Reset Code</Text>
          <Text style={styles.headerSubtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </Animated.View>

        {/* Floating Icons */}
        <View style={[styles.floatingIcon, styles.floatingIcon1]}>
          <Ionicons name="mail" size={20} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.floatingIcon, styles.floatingIcon2]}>
          <Ionicons name="time" size={18} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formWrapper}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.formSection}>
            <Animated.View 
              style={[
                styles.formContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* OTP Input Section */}
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter the 6-digit code</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref!) as any}
                      style={[
                        styles.otpInput,
                        digit ? styles.otpInputFilled : styles.otpInputEmpty
                      ]}
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
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#1e40af', '#059669']}
                  style={[
                    styles.verifyButton,
                    (isLoading || otp.join("").length !== 6) && styles.verifyButtonDisabled
                  ]}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.verifyButtonText}>Verifying...</Text>
                    </View>
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify Code</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>

                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={isLoading}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Help Options */}
            <Animated.View 
              style={[
                styles.helpContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.helpTitle}>Having trouble?</Text>
              <View style={styles.helpOptions}>
                <TouchableOpacity 
                  style={styles.helpOption}
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Ionicons name="mail-outline" size={20} color="#059669" />
                  <Text style={styles.helpOptionText}>Try a different email address</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.helpOption}>
                  <Ionicons name="chatbubble-outline" size={20} color="#1e40af" />
                  <Text style={styles.helpOptionText}>Contact support</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Security Notice */}
            <Animated.View 
              style={[
                styles.securityNotice,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.securityIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#1e40af"
                />
              </View>
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Security Notice</Text>
                <Text style={styles.securityText}>
                  This code will expire in 10 minutes. Never share your
                  verification code with anyone for security purposes.
                </Text>
              </View>
            </Animated.View>

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={styles.backToLoginContainer}
            >
              <Text style={styles.backToLoginText}>
                Remember your password?{" "}
                <Text style={styles.backToLoginLink}>Back to Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Section
  headerSection: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  floatingIcon: {
    position: 'absolute',
  },
  floatingIcon1: {
    top: 80,
    right: 30,
  },
  floatingIcon2: {
    bottom: 60,
    left: 40,
  },

  // Form Section
  formWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  // OTP Section
  otpSection: {
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#f9fafb',
  },
  otpInputEmpty: {
    borderColor: '#e5e7eb',
  },
  otpInputFilled: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
  },

  // Verify Button
  verifyButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Resend Section
  resendSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Help Container
  helpContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  helpOptions: {
    gap: 12,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  helpOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  securityIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  // Back to Login
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  backToLoginLink: {
    color: '#1e40af',
    fontWeight: '600',
  },
});
