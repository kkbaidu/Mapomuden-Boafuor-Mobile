// app/doctor/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";

const { width } = Dimensions.get("window");

interface UpcomingAppointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  appointmentDate: string;
  duration: number;
  type: "in_person" | "video_call" | "phone_call";
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  reason: string;
  notes?: string;
}

export default function DoctorDashboard() {
  const { user, token, isLoading: authLoading } = useAuthContext();
  const {
    stats,
    appointments,
    loading: statsLoading,
    error: statsError,
    refreshAppointments,
    getUpcomingAppointments,
  } = useDoctorAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UpcomingAppointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Don't render if user is not loaded or not a doctor
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user || user.role !== "doctor") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Access denied</Text>
      </View>
    );
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Update upcoming appointments when appointments data changes
    if (appointments.length > 0) {
      // Filter upcoming appointments directly
      const now = new Date();
      const upcoming = appointments
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          return (
            appointmentDate >= now &&
            (appointment.status === "pending" ||
              appointment.status === "confirmed" ||
              appointment.status === "in_progress")
          );
        })
        .sort(
          (a, b) =>
            new Date(a.appointmentDate).getTime() -
            new Date(b.appointmentDate).getTime()
        )
        .slice(0, 5);

      setUpcomingAppointments(upcoming);
    } else {
      setUpcomingAppointments([]);
    }
  }, [appointments]);

  const loadDashboardData = async () => {
    try {
      // Fetch stats and appointments using the hook
      await refreshAppointments();
      // Note: upcoming appointments will be set by useEffect when appointments change

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onPress,
    isLoading = false,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onPress?: () => void;
    isLoading?: boolean;
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
          <Text style={styles.statValue}>{isLoading ? "..." : value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({
    title,
    subtitle,
    icon,
    color,
    onPress,
  }: {
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

  const ActivityItem = ({ activity }: { activity: UpcomingAppointment }) => {
    const formatAppointmentTime = (dateString: string) => {
      const appointmentDate = new Date(dateString);
      const now = new Date();
      const diffInMs = appointmentDate.getTime() - now.getTime();
      const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

      if (diffInHours < 24) {
        return diffInHours > 0
          ? `in ${diffInHours} hours`
          : `${Math.abs(diffInHours)} hours ago`;
      } else {
        const diffInDays = Math.ceil(diffInHours / 24);
        return diffInDays > 0
          ? `in ${diffInDays} days`
          : `${Math.abs(diffInDays)} days ago`;
      }
    };

    const getAppointmentIcon = (type: string) => {
      switch (type) {
        case "video_call":
          return "videocam";
        case "phone_call":
          return "call";
        case "in_person":
        default:
          return "calendar";
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "confirmed":
          return "#10B981";
        case "pending":
          return "#F59E0B";
        case "in_progress":
          return "#3B82F6";
        case "completed":
          return "#8B5CF6";
        case "cancelled":
        case "no_show":
          return "#EF4444";
        default:
          return "#6B7280";
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Ionicons
            name={getAppointmentIcon(activity.type) as any}
            size={20}
            color="#2563EB"
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {activity.patient.firstName} {activity.patient.lastName}
          </Text>
          <Text style={styles.activitySubtitle}>
            {activity.reason} • {activity.type.replace("_", " ")}
          </Text>
          <Text style={styles.activityTime}>
            {formatAppointmentTime(activity.appointmentDate)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(activity.status) },
          ]}
        >
          <Text style={styles.statusText}>{activity.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={["#2563EB", "#1E40AF"]} style={styles.header}>
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
            value={stats?.today || 0}
            icon="calendar-outline"
            color="#2563EB"
            isLoading={statsLoading}
            onPress={() => router.push("/doctor/appointments" as any)}
          />
          <StatCard
            title="Pending Requests"
            value={stats?.pending || 0}
            icon="hourglass-outline"
            color="#F59E0B"
            isLoading={statsLoading}
            onPress={() => router.push("/doctor/appointments" as any)}
          />
          <StatCard
            title="Total Appointments"
            value={stats?.total || 0}
            icon="people-outline"
            color="#10B981"
            isLoading={statsLoading}
            onPress={() => router.push("/doctor/appointments" as any)}
          />
          <StatCard
            title="Completed"
            value={stats?.completed || 0}
            icon="checkmark-circle-outline"
            color="#8B5CF6"
            isLoading={statsLoading}
            onPress={() => router.push("/doctor/appointments" as any)}
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
            onPress={() => router.push("/doctor/appointments" as any)}
          />
          <QuickActionCard
            title="Patient Records"
            subtitle="Access patient files"
            icon="folder"
            color="#10B981"
            onPress={() => router.push("/doctor/patients" as any)}
          />
          <QuickActionCard
            title="Update Profile"
            subtitle="Manage your info"
            icon="person"
            color="#8B5CF6"
            onPress={() => router.push("/doctor/profile" as any)}
          />
          <QuickActionCard
            title="AI Chat"
            subtitle="Get AI assistance"
            icon="chatbubble-ellipses"
            color="#F59E0B"
            onPress={() => router.push("/doctor/ai-chat" as any)}
          />
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity
            onPress={() => router.push("/doctor/appointments" as any)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                No upcoming appointments
              </Text>
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
    backgroundColor: "#F8FAFC",
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
    color: "#E0E7FF",
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#C7D2FE",
  },
  section: {
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 52) / 2,
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 12,
    overflow: "hidden",
    width: (width - 52) / 2,
    height: 120,
  },
  quickActionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
    textAlign: "center",
  },
  activityList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
