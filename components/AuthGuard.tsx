import { router, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inDoctorGroup = segments[0] === 'doctor';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      // User is not authenticated
      if (!inAuthGroup && !inOnboardingGroup) {
        // Redirect to login if not already in auth screens
        router.replace('/(auth)/login');
      }
    } else {
      // User is authenticated
      if (inAuthGroup) {
        // Redirect authenticated users away from auth screens
        if (user?.role === 'doctor') {
          router.replace('/doctor/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else if (user?.role === 'doctor' && inTabsGroup) {
        // Redirect doctors away from patient tabs
        router.replace('/doctor/dashboard');
      } else if (user?.role === 'patient' && inDoctorGroup) {
        // Redirect patients away from doctor screens
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, user?.role]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 text-base">Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};