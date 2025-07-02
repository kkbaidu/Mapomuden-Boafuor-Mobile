import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [healthTips, setHealthTips] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const { user, logout, fetchUser } = useAuthContext();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout()
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion logic here
            console.log('Account deletion requested');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    type = 'nav', 
    value, 
    onValueChange, 
    onPress,
    danger = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    type?: 'nav' | 'switch';
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={danger ? '#EF4444' : '#2563EB'} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive important updates"
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingItem
            icon="calendar-outline"
            title="Appointment Reminders"
            subtitle="Get notified before appointments"
            type="switch"
            value={appointmentReminders}
            onValueChange={setAppointmentReminders}
          />
          <SettingItem
            icon="medical-outline"
            title="Medication Reminders"
            subtitle="Never miss your medication"
            type="switch"
            value={medicationReminders}
            onValueChange={setMedicationReminders}
          />
          <SettingItem
            icon="bulb-outline"
            title="Health Tips"
            subtitle="Receive daily health insights"
            type="switch"
            value={healthTips}
            onValueChange={setHealthTips}
          />
        </View>

        <SectionHeader title="Security & Privacy" />
        <View style={styles.section}>
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            type="switch"
            value={biometricAuth}
            onValueChange={setBiometricAuth}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {
              // Navigate to change password screen
              console.log('Navigate to change password');
            }}
          />
          <SettingItem
            icon="eye-outline"
            title="Privacy Settings"
            subtitle="Manage your data visibility"
            onPress={() => {
              // Navigate to privacy settings
              console.log('Navigate to privacy settings');
            }}
          />
        </View>

        <SectionHeader title="Data & Storage" />
        <View style={styles.section}>
          <SettingItem
            icon="sync-outline"
            title="Auto Sync"
            subtitle="Automatically sync your data"
            type="switch"
            value={dataSync}
            onValueChange={setDataSync}
          />
          <SettingItem
            icon="cloud-offline-outline"
            title="Offline Mode"
            subtitle="Access data without internet"
            type="switch"
            value={offlineMode}
            onValueChange={setOfflineMode}
          />
          <SettingItem
            icon="download-outline"
            title="Download Data"
            subtitle="Export your medical records"
            onPress={() => {
              // Handle data export
              console.log('Export data');
            }}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get answers to common questions"
            onPress={() => {
              // Navigate to help center
              console.log('Navigate to help center');
            }}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Reach out to our support team"
            onPress={() => {
              // Navigate to contact support
              console.log('Contact support');
            }}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            subtitle="Share your experience"
            onPress={() => {
              // Open app store rating
              console.log('Rate app');
            }}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms & Privacy"
            subtitle="Read our policies"
            onPress={() => {
              // Navigate to terms and privacy
              console.log('Navigate to terms and privacy');
            }}
          />
        </View>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            danger
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Digital Healthcare Assistant v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for better healthcare
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dangerItem: {
    backgroundColor: '#FEF2F2',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingRight: {
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});