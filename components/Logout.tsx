import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';

interface LogoutButtonProps {
  style?: 'button' | 'text' | 'icon';
  showConfirmation?: boolean;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  style = 'button',
  showConfirmation = true,
  onLogoutStart,
  onLogoutComplete,
}) => {
  const { logout, isLoading } = useAuthContext();

  const handleLogout = async () => {
    if (showConfirmation) {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    } else {
      performLogout();
    }
  };

  const performLogout = async () => {
    try {
      onLogoutStart?.();
      await logout();
      onLogoutComplete?.();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (style === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        className="p-2"
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color={isLoading ? "#9CA3AF" : "#EF4444"}
        />
      </TouchableOpacity>
    );
  }

  if (style === 'text') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        className="py-2"
      >
        <Text className={`text-base font-medium ${isLoading ? 'text-gray-400' : 'text-red-600'}`}>
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={isLoading}
      className={`w-full py-3 rounded-lg items-center justify-center flex-row ${
        isLoading ? 'bg-red-300' : 'bg-red-600'
      }`}
    >
      <Ionicons
        name="log-out-outline"
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      <Text className="text-white text-base font-semibold">
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </Text>
    </TouchableOpacity>
  );
};