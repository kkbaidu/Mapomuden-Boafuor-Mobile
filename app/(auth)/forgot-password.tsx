import { useAuthContext } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useRef } from "react";
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
import * as Yup from "yup";

const { width, height } = Dimensions.get("window");

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const { forgotPassword, isLoading } = useAuthContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const handleForgotPassword = async (values: { email: string }) => {
    const result = await forgotPassword(values.email);
    
    if (result.success) {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: values.email }
      });
    } else {
      Alert.alert("Error", result.error || "Failed to send verification code");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#1e40af', '#1e3a8a']}
        style={styles.headerSection}
      >
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
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.iconContainer}
          >
            <Ionicons name="key" size={40} color="white" />
          </LinearGradient>
          
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email address and we'll send you a 6-digit verification code to reset your password.
          </Text>
        </Animated.View>

        {/* Floating Elements */}
        <View style={[styles.floatingIcon, styles.floatingIcon1]}>
          <Ionicons name="mail" size={20} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.floatingIcon, styles.floatingIcon2]}>
          <Ionicons name="shield-checkmark" size={18} color="rgba(255,255,255,0.3)" />
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
            {/* Formik Form */}
            <Formik
              initialValues={{ email: "" }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleForgotPassword}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <Animated.View 
                  style={[
                    styles.formContainer,
                    { 
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={[
                      styles.inputContainer,
                      touched.email && errors.email && styles.inputError
                    ]}>
                      <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your email"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        value={values.email}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading || !values.email}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#1e40af', '#059669']}
                      style={[
                        styles.submitButton,
                        (isLoading || !values.email) && styles.submitButtonDisabled
                      ]}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <Text style={styles.submitButtonText}>Sending...</Text>
                        </View>
                      ) : (
                        <Text style={styles.submitButtonText}>
                          Send Verification Code
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Formik>

            {/* Info Section */}
            <Animated.View 
              style={[
                styles.infoContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#1e40af"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>What happens next?</Text>
                <Text style={styles.infoText}>
                  We'll send a 6-digit verification code to your email address. Use this code to verify your identity and create a new password.
                </Text>
              </View>
            </Animated.View>

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => router.back()}
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
    lineHeight: 22,
    paddingHorizontal: 20,
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
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },

  // Button Styles
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
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

  // Info Section
  infoContainer: {
    backgroundColor: 'rgba(30, 64, 175, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    opacity: 0.8,
  },

  // Back to Login
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  backToLoginLink: {
    color: '#1e40af',
    fontWeight: '600',
  },
});