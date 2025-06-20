import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons';
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconType: 'ionicons' | 'material' | 'fontawesome' | 'feather';
  colors: string[];
  route: string;
}

interface HealthMetric {
  id: string;
  title: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
  change: string;
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample user data - in real app, this would come from context/API
  const userName = "Sarah Johnson"; // Replace with actual user name
  const userType = "patient"; // or "doctor"

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Symptom Check',
      subtitle: 'AI-powered analysis',
      icon: 'medical',
      iconType: 'material',
      colors: ['#4f46e5', '#6366f1'],
      route: '/symptoms'
    },
    {
      id: '2',
      title: 'Book Appointment',
      subtitle: 'Find available slots',
      icon: 'calendar-check',
      iconType: 'fontawesome',
      colors: ['#059669', '#34d399'],
      route: '/appointments'
    },
    {
      id: '3',
      title: 'AI Chat',
      subtitle: '24/7 health assistant',
      icon: 'chatbubbles',
      iconType: 'ionicons',
      colors: ['#7c3aed', '#a855f7'],
      route: '/chat'
    },
    {
      id: '4',
      title: 'Prescriptions',
      subtitle: 'View & manage meds',
      icon: 'prescription-bottle-alt',
      iconType: 'fontawesome',
      colors: ['#dc2626', '#f87171'],
      route: '/prescriptions'
    }
  ];

  const healthMetrics: HealthMetric[] = [
    {
      id: '1',
      title: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'good',
      icon: 'heart',
      change: '+2 from last week'
    },
    {
      id: '2',
      title: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'good',
      icon: 'activity',
      change: 'Normal range'
    },
    {
      id: '3',
      title: 'Temperature',
      value: '98.6',
      unit: '°F',
      status: 'good',
      icon: 'thermometer',
      change: 'Normal'
    }
  ];

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Animate on mount
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

    return () => clearInterval(timer);
  }, []);

  const renderIcon = (action: QuickAction) => {
    const iconProps = {
      size: 26,
      color: 'white',
    };

    switch (action.iconType) {
      case 'ionicons':
        return <Ionicons name={action.icon as any} {...iconProps} />;
      case 'material':
        return <MaterialIcons name={action.icon as any} {...iconProps} />;
      case 'fontawesome':
        return <FontAwesome5 name={action.icon as any} {...iconProps} />;
      case 'feather':
        return <Feather name={action.icon as any} {...iconProps} />;
      default:
        return <Ionicons name="help-outline" {...iconProps} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greetingText}>{greeting} 👋</Text>
                <Text style={styles.userName}>{userName.split(' ')[0]}</Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.dateText}>
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.notificationButton}>
                  <View style={styles.notificationIconContainer}>
                    <Ionicons name="notifications-outline" size={22} color="white" />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>3</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>SJ</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Get things done fast</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Link key={action.id} href={action.route as any} asChild>
                <TouchableOpacity
                  style={[styles.quickActionCard]}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={action.colors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickActionGradient}
                  >
                    <View style={styles.quickActionContent}>
                      <View style={styles.quickActionIconContainer}>
                        {renderIcon(action)}
                      </View>
                      <View style={styles.quickActionTextContainer}>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                      </View>
                      <View style={styles.quickActionArrow}>
                        <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </Animated.View>

        {/* Health Metrics */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Overview</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.healthMetricsContainer}>
            {healthMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: getStatusColor(metric.status) }]}>
                    <Feather name={metric.icon as any} size={20} color="white" />
                  </View>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricChange}>{metric.change}</Text>
                  </View>
                </View>
                <View style={styles.metricValue}>
                  <Text style={styles.metricNumber}>{metric.value}</Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Symptom assessment completed</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="calendar" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Appointment scheduled with Dr. Smith</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="medkit" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New prescription available</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </View>
        </Animated.View>

         {/* Emergency Button */}
        <Animated.View 
          style={[
            styles.emergencySection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Alert.alert('Emergency', 'Calling emergency services...')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff416c', '#ff4757']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emergencyGradient}
            >
              <View style={styles.emergencyIconContainer}>
                <Ionicons name="call" size={20} color="white" />
              </View>
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyText}>Emergency Call</Text>
                <Text style={styles.emergencySubtext}>Tap for immediate help</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Health Tips */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <View style={styles.tipCard}>
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.tipGradient}
            >
              <Ionicons name="bulb" size={24} color="white" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Stay Hydrated</Text>
                <Text style={styles.tipText}>
                  Drink at least 8 glasses of water daily to maintain optimal health
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  
  // Header Styles - IMPROVED
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 15 : 25,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4757',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Emergency Section - IMPROVED
  emergencySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  emergencyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#ff416c',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  emergencyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  emergencySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Section Styles - IMPROVED
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
  },

  // Quick Actions Grid - IMPROVED
  quickActionsGrid: {
    gap: 16,
  },
  quickActionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  quickActionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  quickActionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  quickActionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Health Metrics
  healthMetricsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricUnit: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Activity Styles
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Health Tips
  tipCard: {
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  tipContent: {
    marginLeft: 15,
    flex: 1,
  },
  tipTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 20,
  },
});