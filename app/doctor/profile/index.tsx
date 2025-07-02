// app/(tabs)/profile/index.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useMedicalRecordsContext } from '@/contexts/MedicalRecordsContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  location: string;
  role: string;
}

interface MedicalRecord {
  bloodGroup?: string;
  allergies: any[];
  medicalConditions: any[];
  currentMedications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout, fetchUser } = useAuthContext();
  const {
      fetchMedicalRecord,
      medicalRecord,
     } = useMedicalRecordsContext();

  useEffect(() => {
    fetchUser();
    fetchMedicalRecord();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchMedicalRecord()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const ProfileCard = ({ title, subtitle, icon, onPress, rightIcon = 'chevron-forward' }: any) => (
    <TouchableOpacity style={styles.profileCard} onPress={onPress}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={['#2563EB', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#ffffff', '#f3f4f6']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.firstName[0]}{user?.lastName[0]}
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userRole}>
              {(user?.role as string)?.charAt(0).toUpperCase() + user?.role.slice(1)}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location}>{user?.location}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <BlurView intensity={20} style={styles.statsBlur}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{medicalRecord?.currentMedications?.length || 0}</Text>
              <Text style={styles.statLabel}>Medications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{medicalRecord?.allergies?.length || 0}</Text>
              <Text style={styles.statLabel}>Allergies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.bloodGroup || 'N/A'}</Text>
              <Text style={styles.statLabel}>Blood Group</Text>
            </View>
          </BlurView>
        </View>

        {/* Profile Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <ProfileCard
            title="Edit Profile"
            subtitle="Update your personal information"
            icon={{ name: 'person-outline', color: '#2563EB' }}
            onPress={() => router.push('/doctor/profile/editPersonalProfile')}
          />
          
          <ProfileCard
            title="Edit Professional Information"
            subtitle="Update your complete professional records"
            icon={{ name: 'medical-outline', color: '#10B981' }}
            onPress={() => router.push('/doctor/profile/editProfessionalProfile')}
          />
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <ProfileCard
            title="Email"
            subtitle={user?.email}
            icon={{ name: 'mail-outline', color: '#6366F1' }}
            onPress={() => {}}
            rightIcon="copy-outline"
          />
          
          <ProfileCard
            title="Phone"
            subtitle={user?.phone}
            icon={{ name: 'call-outline', color: '#10B981' }}
            onPress={() => {}}
            rightIcon="copy-outline"
          />
        </View>

        {/* Emergency Contact */}
        {medicalRecord?.emergencyContact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <ProfileCard
              title={medicalRecord.emergencyContact.name}
              subtitle={`${medicalRecord.emergencyContact.relationship} • ${medicalRecord.emergencyContact.phone}`}
              icon={{ name: 'shield-checkmark-outline', color: '#EF4444' }}
              onPress={() => {}}
            />
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <ProfileCard
            title="App Settings"
            subtitle="Notifications, privacy, and more"
            icon={{ name: 'settings-outline', color: '#8B5CF6' }}
            onPress={() => router.push('/doctor/profile/settings')}
          />
          
          <ProfileCard
            title="Help & Support"
            subtitle="Get help or contact support"
            icon={{ name: 'help-circle-outline', color: '#F59E0B' }}
            onPress={() => {}}
          />
          
          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    marginTop: -50,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsBlur: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 40,
  },
});