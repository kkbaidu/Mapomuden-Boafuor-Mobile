import { useAuthContext } from '@/contexts/AuthContext';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login, isLoading } = useAuthContext();
  const [animatedStats, setAnimatedStats] = useState({ patients: 0, doctors: 0, consultations: 0 });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      title: "Your Health, Our Priority",
      subtitle: "24/7 AI-powered healthcare assistance at your fingertips",
      icon: "heart"
    },
    {
      title: "Expert Care Anywhere",
      subtitle: "Connect with certified doctors through secure video consultations",
      icon: "medical"
    },
    {
      title: "Smart Health Monitoring",
      subtitle: "Track symptoms and get personalized health insights",
      icon: "pulse"
    }
  ];

  // Initialize animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation
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
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      Animated.timing(slideAnim, {
        toValue: currentSlide + 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Animate stats on mount
  useEffect(() => {
    const animateValue = (end: number, key: string, duration = 2000) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(start) }));
      }, 16);
    };

    setTimeout(() => {
      animateValue(15000, 'patients');
      animateValue(500, 'doctors');
      animateValue(50000, 'consultations');
    }, 500);
  }, []);

  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (!result.success) {
      Alert.alert("Login Failed", result.error || "Something went wrong");
    }

  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Ionicons name="heart" size={40} color="white" />;
      case 'medical':
        return <FontAwesome5 name="stethoscope" size={36} color="white" />;
      case 'pulse':
        return <MaterialIcons name="monitor-heart" size={40} color="white" />;
      default:
        return <Ionicons name="heart" size={40} color="white" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <LinearGradient
          colors={['#1e40af', '#1e3a8a', '#1d4ed8']}
          style={styles.heroSection}
        >
          {/* Background Pattern */}
          <View style={styles.backgroundPattern}>
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: Math.random() * width,
                    top: Math.random() * 300,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>

          {/* Carousel Content */}
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              {renderIcon(slides[currentSlide].icon)}
            </Animated.View>
            
            <Text style={styles.heroTitle}>{slides[currentSlide].title}</Text>
            <Text style={styles.heroSubtitle}>{slides[currentSlide].subtitle}</Text>

            {/* Slide Indicators */}
            <View style={styles.indicators}>
              {slides.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentSlide(index)}
                  style={[
                    styles.indicator,
                    { backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)' }
                  ]}
                />
              ))}
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{animatedStats.patients.toLocaleString()}+</Text>
                <Text style={styles.statLabel}>Patients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{animatedStats.doctors}+</Text>
                <Text style={styles.statLabel}>Doctors</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{animatedStats.consultations.toLocaleString()}+</Text>
                <Text style={styles.statLabel}>Consultations</Text>
              </View>
            </View>
          </Animated.View>

          {/* Floating Icons */}
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon1, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="shield-checkmark" size={24} color="rgba(255,255,255,0.3)" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon2, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="people" size={20} color="rgba(255,255,255,0.3)" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon3, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="time" size={22} color="rgba(255,255,255,0.3)" />
          </Animated.View>
        </LinearGradient>

        {/* Login Form Section */}
        <View style={styles.formSection}>
          {/* Header */}
          <View style={styles.formHeader}>
            <LinearGradient
              colors={['#1e40af', '#059669']}
              style={styles.logoContainer}
            >
              <Ionicons name="heart" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to access your healthcare dashboard</Text>
          </View>

          {/* Form Container */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9ca3af"
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
            </View>

            {/* Forgot Password */}
            <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            </Link>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1e40af', '#059669']}
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
              </Link>
            </View>

            {/* Emergency Access */}
            <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.7}>
              <Text style={styles.emergencyText}>🚨 Emergency Access (No Account Required)</Text>
              <Text style={styles.emergencySubtext}>Access basic health information</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color="#6b7280" />
              <Text style={styles.trustText}>HIPAA Compliant</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="heart" size={16} color="#6b7280" />
              <Text style={styles.trustText}>FDA Approved</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="people" size={16} color="#6b7280" />
              <Text style={styles.trustText}>Trusted by 15K+</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section Styles
  heroSection: {
    height: height * 0.45,
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
  heroContent: {
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
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  floatingIcon: {
    position: 'absolute',
  },
  floatingIcon1: {
    top: 60,
    left: 30,
  },
  floatingIcon2: {
    top: 120,
    right: 30,
  },
  floatingIcon3: {
    bottom: 120,
    left: 50,
  },

  // Form Section Styles
  formSection: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },

  // Button Styles
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Divider Styles
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#6b7280',
  },

  // Social Login Styles
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  // Sign Up Styles
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 15,
  },
  signUpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },

  // Emergency Access Styles
  emergencyButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emergencyText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  emergencySubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Trust Indicators Styles
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 30,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
  },
});

export default LoginPage;