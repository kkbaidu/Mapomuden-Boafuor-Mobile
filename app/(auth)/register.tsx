import { useAuthContext } from "@/contexts/AuthContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
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

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().min(2, "First name must be at least 2 characters").required("First name is required"),
  lastName: Yup.string().min(2, "Last name must be at least 2 characters").required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  role: Yup.string().oneOf(["patient", "doctor"]).required("Please select your role"),
});

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { register, isLoading } = useAuthContext();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { title: "Personal Info", icon: "person", color: "#1e40af" },
    { title: "Account Setup", icon: "key", color: "#059669" },
    { title: "Role Selection", icon: "medical", color: "#7c3aed" }
  ];

  // Initialize animations
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
      })
    ]).start();

    // Pulse animation for floating elements
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();
  }, []);

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "patient" | "doctor";
  }) => {
    const result = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    if (!result.success) {
      Alert.alert("Registration Failed", result.error || "Something went wrong");
    }
  };

  const updateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Hero Header */}
          <LinearGradient
            colors={['#1e40af', '#1e3a8a', '#059669']}
            style={styles.heroHeader}
          >
            {/* Background Elements */}
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

            {/* Header Content */}
            <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="person-add" size={36} color="white" />
              </Animated.View>
              <Text style={styles.heroTitle}>Join Our Community</Text>
              <Text style={styles.heroSubtitle}>Create your account and start your health journey</Text>
            </Animated.View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>Step {currentStep + 1} of {steps.length}</Text>
            </View>

            {/* Floating Icons */}
            <Animated.View style={[styles.floatingIcon, styles.floatingIcon1, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="shield-checkmark" size={20} color="rgba(255,255,255,0.3)" />
            </Animated.View>
            <Animated.View style={[styles.floatingIcon, styles.floatingIcon2, { transform: [{ scale: pulseAnim }] }]}>
              <FontAwesome5 name="user-md" size={18} color="rgba(255,255,255,0.3)" />
            </Animated.View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "patient" as "patient" | "doctor",
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => (
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                  
                  {/* Step Indicators */}
                  <View style={styles.stepIndicators}>
                    {steps.map((step, index) => (
                      <View key={index} style={styles.stepItem}>
                        <View style={[
                          styles.stepCircle,
                          { backgroundColor: index <= currentStep ? step.color : '#e5e7eb' }
                        ]}>
                          <Ionicons 
                            name={step.icon as any} 
                            size={16} 
                            color={index <= currentStep ? 'white' : '#9ca3af'} 
                          />
                        </View>
                        <Text style={[
                          styles.stepLabel,
                          { color: index <= currentStep ? step.color : '#9ca3af' }
                        ]}>
                          {step.title}
                        </Text>
                        {index < steps.length - 1 && (
                          <View style={[
                            styles.stepConnector,
                            { backgroundColor: index < currentStep ? steps[index + 1].color : '#e5e7eb' }
                          ]} />
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Form Fields */}
                  <View style={styles.fieldsContainer}>
                    
                    {/* Personal Information */}
                    <View style={styles.formGroup}>
                      <View style={styles.groupHeader}>
                        <Ionicons name="person" size={20} color="#1e40af" />
                        <Text style={styles.groupTitle}>Personal Information</Text>
                      </View>
                      
                      <View style={styles.inputRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                          <Text style={styles.inputLabel}>First Name</Text>
                          <View style={[styles.inputContainer, touched.firstName && errors.firstName && styles.inputError]}>
                            <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                              style={styles.textInput}
                              placeholder="John"
                              placeholderTextColor="#9ca3af"
                              autoCapitalize="words"
                              onChangeText={(text) => {
                                handleChange("firstName")(text);
                                updateProgress(0);
                                setCurrentStep(0);
                              }}
                              onBlur={handleBlur("firstName")}
                              value={values.firstName}
                            />
                          </View>
                          {touched.firstName && errors.firstName && (
                            <Text style={styles.errorText}>{errors.firstName}</Text>
                          )}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                          <Text style={styles.inputLabel}>Last Name</Text>
                          <View style={[styles.inputContainer, touched.lastName && errors.lastName && styles.inputError]}>
                            <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                              style={styles.textInput}
                              placeholder="Doe"
                              placeholderTextColor="#9ca3af"
                              autoCapitalize="words"
                              onChangeText={handleChange("lastName")}
                              onBlur={handleBlur("lastName")}
                              value={values.lastName}
                            />
                          </View>
                          {touched.lastName && errors.lastName && (
                            <Text style={styles.errorText}>{errors.lastName}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={[styles.inputContainer, touched.email && errors.email && styles.inputError]}>
                          <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.textInput}
                            placeholder="john.doe@example.com"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={handleChange("email")}
                            onBlur={handleBlur("email")}
                            value={values.email}
                          />
                        </View>
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                      </View>
                    </View>

                    {/* Account Security */}
                    <View style={styles.formGroup}>
                      <View style={styles.groupHeader}>
                        <Ionicons name="lock-closed" size={20} color="#059669" />
                        <Text style={styles.groupTitle}>Account Security</Text>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={[styles.inputContainer, touched.password && errors.password && styles.inputError]}>
                          <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                          <TextInput
                            style={[styles.textInput, styles.passwordInput]}
                            placeholder="Create a strong password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            onChangeText={(text) => {
                              handleChange("password")(text);
                              updateProgress(1);
                              setCurrentStep(1);
                            }}
                            onBlur={handleBlur("password")}
                            value={values.password}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                          >
                            <Ionicons
                              name={showPassword ? "eye-off-outline" : "eye-outline"}
                              size={18}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                        </View>
                        {touched.password && errors.password && (
                          <Text style={styles.errorText}>{errors.password}</Text>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={[styles.inputContainer, touched.confirmPassword && errors.confirmPassword && styles.inputError]}>
                          <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                          <TextInput
                            style={[styles.textInput, styles.passwordInput]}
                            placeholder="Confirm your password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showConfirmPassword}
                            onChangeText={handleChange("confirmPassword")}
                            onBlur={handleBlur("confirmPassword")}
                            value={values.confirmPassword}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                          >
                            <Ionicons
                              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                              size={18}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                        </View>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                      </View>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.formGroup}>
                      <View style={styles.groupHeader}>
                        <Ionicons name="people" size={20} color="#7c3aed" />
                        <Text style={styles.groupTitle}>Select Your Role</Text>
                      </View>

                      <View style={styles.roleContainer}>
                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue("role", "patient");
                            updateProgress(2);
                            setCurrentStep(2);
                          }}
                          style={[
                            styles.roleCard,
                            values.role === "patient" && styles.roleCardSelected
                          ]}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={values.role === "patient" ? ['#1e40af', '#1e3a8a'] : ['#f8fafc', '#f1f5f9']}
                            style={styles.roleCardGradient}
                          >
                            <View style={styles.roleIconContainer}>
                              <Ionicons
                                name="person"
                                size={28}
                                color={values.role === "patient" ? "white" : "#6b7280"}
                              />
                            </View>
                            <Text style={[
                              styles.roleTitle,
                              { color: values.role === "patient" ? "white" : "#374151" }
                            ]}>
                              Patient
                            </Text>
                            <Text style={[
                              styles.roleDescription,
                              { color: values.role === "patient" ? "rgba(255,255,255,0.8)" : "#6b7280" }
                            ]}>
                              Seeking healthcare services
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue("role", "doctor");
                            updateProgress(2);
                            setCurrentStep(2);
                          }}
                          style={[
                            styles.roleCard,
                            values.role === "doctor" && styles.roleCardSelected
                          ]}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={values.role === "doctor" ? ['#059669', '#047857'] : ['#f8fafc', '#f1f5f9']}
                            style={styles.roleCardGradient}
                          >
                            <View style={styles.roleIconContainer}>
                              <FontAwesome5
                                name="user-md"
                                size={28}
                                color={values.role === "doctor" ? "white" : "#6b7280"}
                              />
                            </View>
                            <Text style={[
                              styles.roleTitle,
                              { color: values.role === "doctor" ? "white" : "#374151" }
                            ]}>
                              Doctor
                            </Text>
                            <Text style={[
                              styles.roleDescription,
                              { color: values.role === "doctor" ? "rgba(255,255,255,0.8)" : "#6b7280" }
                            ]}>
                              Providing healthcare services
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                      {touched.role && errors.role && (
                        <Text style={styles.errorText}>{errors.role}</Text>
                      )}
                    </View>

                    {/* Terms and Conditions */}
                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#1e40af', '#059669']}
                        style={styles.submitButton}
                      >
                        {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <Text style={styles.submitButtonText}>Creating Account...</Text>
                            <View style={styles.loadingSpinner} />
                          </View>
                        ) : (
                          <Text style={styles.submitButtonText}>Create Account</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                      <Text style={styles.signInText}>Already have an account? </Text>
                      <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                          <Text style={styles.signInLink}>Sign In</Text>
                        </TouchableOpacity>
                      </Link>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Formik>
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

  // Hero Header Styles
  heroHeader: {
    height: height * 0.3,
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
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'white',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressTrack: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  floatingIcon: {
    position: 'absolute',
  },
  floatingIcon1: {
    top: 40,
    left: 30,
  },
  floatingIcon2: {
    top: 60,
    right: 30,
  },

  // Form Section Styles
  formSection: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
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

  // Step Indicators
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepConnector: {
    position: 'absolute',
    top: 18,
    left: '60%',
    right: '-60%',
    height: 2,
    zIndex: -1,
  },

  // Form Groups
  fieldsContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 25,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },

  // Input Styles
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  passwordInput: {
    paddingRight: 35,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },

  // Role Selection
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  roleCardSelected: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  roleCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  roleIconContainer: {
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Terms and Submit
  termsContainer: {
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: '#1e40af',
    fontWeight: '500',
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  loadingSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: 'white',
    borderTopColor: 'transparent',
    borderRadius: 8,
    marginLeft: 8,
  },

  // Sign In Link
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signInLink: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
});