import { useAuthContext } from "@/contexts/AuthContext";
import { useMedicalRecordsContext } from "@/contexts/MedicalRecordsContext";
import { useAppointments } from "@/hooks/useAppointments";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Activity,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Pill,
  Plus,
  Search,
  Star,
  Thermometer,
  TrendingUp,
  User,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const HealthcareHomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState("Sarah");
  const [showNotification, setShowNotification] = useState(true);
  const { user } = useAuthContext();
  const { fetchMedicalRecord, medicalRecord } = useMedicalRecordsContext();
  const {
    appointments,
    loading: appointmentsLoading,
    filterAppointments,
  } = useAppointments();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchMedicalRecord();
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAppointmentDate = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time to compare just dates
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return "Today";
    } else if (appointmentDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return appointmentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = (() => {
    try {
      return filterAppointments("upcoming")
        .filter((appointment) => {
          if (!appointment?.appointmentDate) return false;
          const appointmentDate = new Date(appointment.appointmentDate);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          return (
            appointmentDate <= nextWeek && appointment.status !== "cancelled"
          );
        })
        .slice(0, 3) // Show only first 3 upcoming appointments
        .map((appointment) => ({
          id: appointment._id,
          doctor: `Dr. ${
            appointment.doctorPersionalInfo?.firstName || "Unknown"
          } ${appointment.doctorPersionalInfo?.lastName || "Doctor"}`,
          specialty:
            appointment.doctorProfessionalInfo?.specialization?.name ||
            "General Practice",
          time: formatAppointmentTime(appointment.appointmentDate),
          date: formatAppointmentDate(appointment.appointmentDate),
          type: appointment.type,
          status: appointment.status,
          avatar: "👨‍⚕️", // You could make this dynamic based on doctor info
        }));
    } catch (error) {
      console.error("Error filtering appointments:", error);
      return [];
    }
  })();

  const healthStats = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: medicalRecord?.vitalSigns?.at?.(-1)?.heartRate || "--",
      unit: "bpm",
      trend: "up",
      color: "#EF4444",
    },
    {
      icon: Activity,
      label: "Blood Pressure",
      value: `${
        medicalRecord?.vitalSigns?.at?.(-1)?.bloodPressure?.systolic || "--"
      }/${
        medicalRecord?.vitalSigns?.at?.(0)?.bloodPressure?.diastolic || "--"
      }`,
      unit: "mmHg",
      trend: "up",
      color: "#2563EB",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: medicalRecord?.vitalSigns?.at?.(-1)?.temperature || "--",
      unit: "°F",
      trend: "stable",
      color: "#F97316",
    },
    {
      icon: Zap,
      label: "Weight",
      value: medicalRecord?.vitalSigns?.at?.(-1)?.weight || "--",
      unit: "kg",
      trend: "up",
      color: "#EAB308",
    },
  ];

  const quickActions = [
    {
      icon: MessageCircle,
      label: "AI Chat",
      colors: ["#3B82F6", "#2563EB"],
      description: "Get instant health advice",
      route: "/chat",
    },
    {
      icon: Calendar,
      label: "Book Appointment",
      colors: ["#10B981", "#059669"],
      description: "Schedule with doctors",
      route: "/appointments",
    },
    {
      icon: Pill,
      label: "Medications",
      colors: ["#8B5CF6", "#7C3AED"],
      description: "Track prescriptions",
      route: "/profile/medical-history",
    },
    {
      icon: Activity,
      label: "Symptom Check",
      colors: ["#EC4899", "#DB2777"],
      description: "AI-powered assessment",
      route: "/symptom-check",
    },
  ];

  const healthTips = [
    {
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily",
      icon: "💧",
    },
    {
      title: "Regular Exercise",
      description: "30 minutes of activity keeps you healthy",
      icon: "🏃‍♀️",
    },
    {
      title: "Quality Sleep",
      description: "7-9 hours of sleep improves your wellbeing",
      icon: "😴",
    },
  ];

  const HealthStatCard = ({ stat }: { stat: any }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <stat.icon size={20} color={stat.color} />
        <TrendingUp
          size={16}
          color={stat.trend === "up" ? "#10B981" : "#6B7280"}
        />
      </View>
      <View style={styles.statContent}>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statUnit}>{stat.unit}</Text>
        </View>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
    </View>
  );

  const QuickActionCard = ({ action }: { action: any }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      activeOpacity={0.8}
      onPress={() => router.push(action.route)}
    >
      <LinearGradient
        colors={action.colors}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <action.icon size={24} color="white" />
      </LinearGradient>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
      <Text style={styles.quickActionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => router.push("/appointments" as any)}
      activeOpacity={0.8}
    >
      <View style={styles.appointmentContent}>
        <View style={styles.appointmentLeft}>
          <Text style={styles.appointmentAvatar}>{appointment.avatar}</Text>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
            <Text style={styles.appointmentSpecialty}>
              {appointment.specialty}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentRight}>
          <View style={styles.appointmentTimeContainer}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.appointmentTime}>{appointment.time}</Text>
          </View>
          <Text style={styles.appointmentDate}>{appointment.date}</Text>
        </View>
      </View>
      <View style={styles.appointmentFooter}>
        <View style={styles.appointmentLocationContainer}>
          <MapPin size={12} color="#6B7280" />
          <Text style={styles.appointmentLocation}>
            {appointment.type === "video_call"
              ? "Virtual Consultation"
              : appointment.type === "phone_call"
              ? "Phone Consultation"
              : "In-Person Visit"}
          </Text>
        </View>
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const HealthTipCard = ({ tip }: { tip: any }) => (
    <LinearGradient
      colors={["#EFF6FF", "#F0FDF4"]}
      style={styles.healthTipCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.healthTipContent}>
        <Text style={styles.healthTipIcon}>{tip.icon}</Text>
        <View style={styles.healthTipText}>
          <Text style={styles.healthTipTitle}>{tip.title}</Text>
          <Text style={styles.healthTipDescription}>{tip.description}</Text>
        </View>
        <Star size={20} color="#FBBF24" fill="#FBBF24" />
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <LinearGradient
        colors={["rgba(255,255,255,0.95)", "rgba(248,250,252,0.95)"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={["#2563EB", "#10B981"]}
              style={styles.headerLogo}
            >
              <Heart size={24} color="white" />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Good morning, {user?.firstName} !
              </Text>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} • How are you feeling today?
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={20} color="#475569" />
              {showNotification && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/profile")}
            >
              <LinearGradient
                colors={["#2563EB", "#10B981"]}
                style={styles.profileButton}
              >
                <User size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Search Bar */}
          {/* <View style={styles.searchContainer}>
            <Search size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="Search doctors, symptoms, medications..."
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
            />
          </View> */}

          {/* Health Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Health Overview</Text>
              <TouchableOpacity
                style={styles.sectionAction}
                onPress={() => router.push("/profile/medical-history")}
              >
                <Text style={styles.sectionActionText}>View Details</Text>
                <ChevronRight size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsGrid}>
              {healthStats.map((stat, index) => (
                <HealthStatCard key={index} stat={stat} />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} />
              ))}
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity
                style={styles.sectionAction}
                onPress={() => router.push("/appointments" as any)}
              >
                <Plus size={16} color="#2563EB" />
                <Text style={styles.sectionActionText}>Book New</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentsList}>
              {appointmentsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Loading appointments...
                  </Text>
                </View>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment, index) => (
                  <AppointmentCard
                    key={appointment.id || index}
                    appointment={appointment}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Calendar
                    size={48}
                    color="#CBD5E1"
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.emptyTitle}>
                    No Upcoming Appointments
                  </Text>
                  <Text style={styles.emptyDescription}>
                    Book an appointment with a doctor to get started
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push("/appointments" as any)}
                  >
                    <Text style={styles.emptyButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Health Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Health Tips</Text>
            <View style={styles.healthTipsList}>
              {healthTips.map((tip, index) => (
                <HealthTipCard key={index} tip={tip} />
              ))}
            </View>
          </View>

          {/* Emergency Contact */}
          <LinearGradient
            colors={["#EF4444", "#DC2626"]}
            style={styles.emergencyCard}
          >
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Emergency Contact</Text>
                <Text style={styles.emergencySubtitle}>
                  24/7 medical support available
                </Text>
              </View>
              <TouchableOpacity style={styles.emergencyButton}>
                <Heart size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.emergencyFooter}>
              <Text style={styles.emergencyFooterText}>
                Call 911 or your local emergency number
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: "#64748B",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: "#EF4444",
    borderRadius: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: {
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statContent: {
    gap: 4,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statUnit: {
    fontSize: 12,
    color: "#64748B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 20,
    width: (width - 52) / 2,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    alignItems: "flex-start",
  },
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: "#64748B",
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  appointmentContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appointmentAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: "#64748B",
  },
  appointmentRight: {
    alignItems: "flex-end",
  },
  appointmentTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#64748B",
  },
  appointmentDate: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  appointmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  appointmentLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appointmentLocation: {
    fontSize: 12,
    color: "#64748B",
  },
  healthTipsList: {
    gap: 12,
  },
  healthTipCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.3)",
  },
  healthTipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  healthTipIcon: {
    fontSize: 24,
  },
  healthTipText: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  healthTipDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  emergencyCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  emergencyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  emergencyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  emergencyFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  emergencyFooterText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HealthcareHomeScreen;
