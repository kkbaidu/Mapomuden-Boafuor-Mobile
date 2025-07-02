// app/doctor/dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthContext } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  weeklyEarnings: number;
  monthlyAppointments: number;
  rating: number;
  totalReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'review' | 'patient';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export default function DoctorDashboard() {
  const { user, token } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    weeklyEarnings: 0,
    monthlyAppointments: 0,
    rating: 0,
    totalReviews: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
    //   const [statsResponse, activityResponse] = await Promise.all([
    //     axios.get(`${BASE_URL}/doctor/dashboard/stats`, {
    //       headers: { Authorization: `Bearer ${token}` }
    //     }),
    //     axios.get(`${BASE_URL}/doctor/dashboard/activity`, {
    //       headers: { Authorization: `Bearer ${token}` }
    //     })
    //   ]);

    //   setStats(statsResponse.data);
    //   setRecentActivity(activityResponse.data);
    console.log('Loading dashboard data...');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, color, onPress }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[color, `${color}90`]}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon as any} size={30} color="#fff" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons
          name={
            activity.type === 'appointment' ? 'calendar' :
            activity.type === 'review' ? 'star' : 'person'
          }
          size={20}
          color="#2563EB"
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
      {activity.status && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: activity.status === 'pending' ? '#F59E0B' : '#10B981' }
        ]}>
          <Text style={styles.statusText}>{activity.status}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.doctorName}>
            Dr. {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.headerSubtitle}>
            Ready to help your patients today?
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon="calendar-outline"
            color="#2563EB"
            onPress={() => router.push('/doctor/appointments' as any)}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingAppointments}
            icon="hourglass-outline"
            color="#F59E0B"
            onPress={() => router.push('/doctor/appointments' as any)}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="people-outline"
            color="#10B981"
            onPress={() => router.push('/doctor/patients' as any)}
          />
          <StatCard
            title="Rating"
            value={`${stats.rating}/5`}
            icon="star-outline"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            title="View Schedule"
            subtitle="Today's appointments"
            icon="calendar"
            color="#2563EB"
            onPress={() => router.push('/doctor/appointments' as any)}
          />
          <QuickActionCard
            title="Patient Records"
            subtitle="Access patient files"
            icon="folder"
            color="#10B981"
            onPress={() => router.push('/doctor/patients' as any)}
          />
          <QuickActionCard
            title="Update Profile"
            subtitle="Manage your info"
            icon="person"
            color="#8B5CF6"
            onPress={() => router.push('/doctor/profile' as any)}
          />
          <QuickActionCard
            title="Analytics"
            subtitle="View insights"
            icon="analytics"
            color="#F59E0B"
            onPress={() => Alert.alert('Coming Soon', 'Analytics feature is under development')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Full activity log coming soon')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerContent: {
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 52) / 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    width: (width - 52) / 2,
    height: 120,
  },
  quickActionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});