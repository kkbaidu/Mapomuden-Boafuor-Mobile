import { useAuthContext } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as Yup from "yup";

const { width, height } = Dimensions.get('window');

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ResetPasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuthContext();
  const { resetToken, email } = useLocalSearchParams<{ 
    resetToken: string; 
    email: string; 
  }>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();
  }, []);

  const handleResetPassword = async (values: { 
    password: string; 
    confirmPassword: string; 
  }) => {
    if (!resetToken) {
      Alert.alert("Error", "Reset token is missing");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(resetToken, values.password);

      if (result.success) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset successfully! You are now logged in.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        Alert.alert("Reset Failed", result.error || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Header Section */}
          <LinearGradient
            colors={['#1e40af', '#1e3a8a', '#1d4ed8']}
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
            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="lock-closed" size={40} color="white" />
              </Animated.View>
              
              <Text style={styles.headerTitle}>Create New Password</Text>
              <Text style={styles.headerSubtitle}>
                Your identity has been verified. Create a strong password for your account.
              </Text>
              {email && (
                <View style={styles.emailContainer}>
                  <Ionicons name="mail" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              )}
            </Animated.View>

            {/* Floating Icons */}
            <Animated.View style={[styles.floatingIcon, styles.floatingIcon1, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="shield-checkmark" size={20} color="rgba(255,255,255,0.3)" />
            </Animated.View>
            <Animated.View style={[styles.floatingIcon, styles.floatingIcon2, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="key" size={18} color="rgba(255,255,255,0.3)" />
            </Animated.View>
          </LinearGradient>

          {/* Form Section */}
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
              {/* Formik Form */}
              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleResetPassword}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View style={styles.formContent}>
                    {/* New Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>New Password</Text>
                      <View style={[
                        styles.inputContainer,
                        touched.password && errors.password && styles.inputError
                      ]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter new password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showPassword}
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          value={values.password}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                      {touched.password && errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <View style={[
                        styles.inputContainer,
                        touched.confirmPassword && errors.confirmPassword && styles.inputError
                      ]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Confirm new password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showConfirmPassword}
                          onChangeText={handleChange("confirmPassword")}
                          onBlur={handleBlur("confirmPassword")}
                          value={values.confirmPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                      )}
                    </View>

                    {/* Password Requirements */}
                    <View style={styles.requirementsContainer}>
                      <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                      <View style={styles.requirementsList}>
                        <View style={styles.requirementItem}>
                          <Ionicons
                            name={values.password.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={values.password.length >= 6 ? "#059669" : "#9ca3af"}
                          />
                          <Text style={[
                            styles.requirementText,
                            values.password.length >= 6 && styles.requirementTextActive
                          ]}>
                            At least 6 characters
                          </Text>
                        </View>
                        <View style={styles.requirementItem}>
                          <Ionicons
                            name={values.password === values.confirmPassword && values.password.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={values.password === values.confirmPassword && values.password.length > 0 ? "#059669" : "#9ca3af"}
                          />
                          <Text style={[
                            styles.requirementText,
                            values.password === values.confirmPassword && values.password.length > 0 && styles.requirementTextActive
                          ]}>
                            Passwords match
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isLoading || !values.password || !values.confirmPassword}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#1e40af', '#059669']}
                        style={[
                          styles.submitButton,
                          (isLoading || !values.password || !values.confirmPassword) && styles.submitButtonDisabled
                        ]}
                      >
                        {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <Text style={styles.submitButtonText}>Resetting...</Text>
                          </View>
                        ) : (
                          <Text style={styles.submitButtonText}>Reset Password</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <View style={styles.securityNoticeContent}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#1e40af"
                  />
                  <View style={styles.securityNoticeText}>
                    <Text style={styles.securityNoticeTitle}>Security Tip</Text>
                    <Text style={styles.securityNoticeDescription}>
                      Use a strong password with a mix of letters, numbers, and symbols. 
                      Avoid using personal information or common words.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  style={styles.footerButton}
                >
                  <Text style={styles.footerText}>
                    Remember your password?{" "}
                    <Text style={styles.footerLink}>Back to Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header Section Styles
  headerSection: {
    height: height * 0.35,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
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
    marginBottom: 15,
    lineHeight: 22,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  floatingIcon: {
    position: 'absolute',
  },
  floatingIcon1: {
    top: 80,
    right: 30,
  },
  floatingIcon2: {
    bottom: 80,
    left: 40,
  },

  // Form Section Styles
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
  formContent: {
    marginBottom: 20,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },

  // Password Requirements Styles
  requirementsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 25,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  requirementTextActive: {
    color: '#059669',
    fontWeight: '500',
  },

  // Button Styles
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Security Notice Styles
  securityNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  securityNoticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityNoticeText: {
    marginLeft: 12,
    flex: 1,
  },
  securityNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  securityNoticeDescription: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },

  // Footer Styles
  footer: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    color: '#1e40af',
    fontWeight: '600',
  },
});