import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthContext } from "../../../contexts/AuthContext";
import {
  prescriptionAPI,
  Prescription,
} from "../../../services/prescriptionAPI";

type FilterType = "all" | "active" | "completed";

const PrescriptionsScreen = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<
    Prescription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrescriptions = async () => {
    if (!user) return;

    // Ensure _id is available (backend may send id only)
    const effectiveUserId = (user as any)._id || (user as any).id;

    try {
      setLoading(true);
      let response;

      if (user?.role === "doctor") {
        response = await prescriptionAPI.getDoctorPrescriptions();
      } else if (effectiveUserId) {
        // Pass no patientId (backend auto-filters) OR adjust locally if needed
        response = await prescriptionAPI.getDoctorPrescriptions();
      } else {
        throw new Error("User not properly authenticated");
      }

      if (response && response.prescriptions) {
        // If patient, filter on client side since backend route returns by current auth user
        const list =
          user.role === "patient"
            ? response.prescriptions.filter((p: any) => {
                const pid =
                  (p.patient && (p.patient._id || p.patient.id || p.patient)) ||
                  null;
                return pid === effectiveUserId;
              })
            : response.prescriptions;
        setPrescriptions(list);
        setFilteredPrescriptions(list);
      }
    } catch (error: any) {
      console.error("Fetch prescriptions error:", error);
      Alert.alert("Error", error.message || "Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrescriptions();
    setRefreshing(false);
  };

  const filterPrescriptions = (
    filter: FilterType,
    search: string = searchQuery
  ) => {
    let filtered = prescriptions;

    // Filter by status with expiry date logic
    if (filter !== "all") {
      filtered = filtered.filter((prescription) => {
        const isExpired = new Date(prescription.expiryDate) < new Date();

        if (filter === "active") {
          // Active: status is active AND not expired
          return prescription.status === "active" && !isExpired;
        } else if (filter === "completed") {
          // Completed: status is completed OR expired
          return (
            prescription.status === "completed" ||
            prescription.status === "expired" ||
            isExpired
          );
        }
        return false;
      });
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(
        (prescription) =>
          prescription.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
          prescription.doctor.firstName
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          prescription.doctor.lastName
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          prescription.medications.some((med) =>
            med.name.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterPrescriptions(filter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPrescriptions(activeFilter, query);
  };

  const getStatusColor = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();

    if (isExpired && status === "active") {
      return "#6B7280"; // Show as completed if expired
    }

    switch (status) {
      case "active":
        return "#10B981";
      case "completed":
      case "expired":
        return "#6B7280";
      case "cancelled":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();

    if (isExpired && status === "active") {
      return "checkmark-done-circle"; // Show as completed if expired
    }

    switch (status) {
      case "active":
        return "checkmark-circle";
      case "completed":
      case "expired":
        return "checkmark-done-circle";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getDisplayStatus = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();

    if (isExpired && status === "active") {
      return "Completed";
    }

    switch (status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "expired":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderPrescriptionCard = ({ item }: { item: Prescription }) => (
    <TouchableOpacity
      style={styles.prescriptionCard}
      onPress={() => router.push(`/prescriptions/details/${item._id}`)}
    >
      <LinearGradient
        colors={["#ffffff", "#f8fafc"]}
        style={styles.cardGradient}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(item.status, item.expiryDate)}
              size={16}
              color={getStatusColor(item.status, item.expiryDate)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status, item.expiryDate) },
              ]}
            >
              {getDisplayStatus(item.status, item.expiryDate)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {formatDate(item.prescriptionDate)}
          </Text>
        </View>

        {/* Doctor Info */}
        <View style={styles.doctorInfo}>
          <MaterialIcons name="local-hospital" size={20} color="#6B7280" />
          <Text style={styles.doctorName}>
            Dr. {item.doctor.firstName} {item.doctor.lastName}
          </Text>
        </View>

        {/* Diagnosis */}
        <View style={styles.diagnosisContainer}>
          <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
          <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
        </View>

        {/* Medications Count */}
        <View style={styles.medicationsCount}>
          <Ionicons name="medical" size={16} color="#10B981" />
          <Text style={styles.medicationsText}>
            {item.medications.length} medication
            {item.medications.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Expiry Date */}
        <View style={styles.expiryContainer}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={
              new Date(item.expiryDate) < new Date() ? "#EF4444" : "#6B7280"
            }
          />
          <Text
            style={[
              styles.expiryText,
              {
                color:
                  new Date(item.expiryDate) < new Date()
                    ? "#EF4444"
                    : "#6B7280",
              },
            ]}
          >
            Expires: {formatDate(item.expiryDate)}
          </Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    filter: FilterType,
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.countBadge,
          activeFilter === filter && styles.countBadgeActive,
        ]}
      >
        <Text
          style={[
            styles.countBadgeText,
            activeFilter === filter && styles.countBadgeTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getFilterCounts = () => {
    const activePrescriptions = prescriptions.filter((p) => {
      const isExpired = new Date(p.expiryDate) < new Date();
      return p.status === "active" && !isExpired;
    });

    const completedPrescriptions = prescriptions.filter((p) => {
      const isExpired = new Date(p.expiryDate) < new Date();
      return p.status === "completed" || p.status === "expired" || isExpired;
    });

    return {
      all: prescriptions.length,
      active: activePrescriptions.length,
      completed: completedPrescriptions.length,
    };
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPrescriptions();
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading prescriptions...</Text>
      </View>
    );
  }

  const filterCounts = getFilterCounts();

  // Don't render if user is not loaded
  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#EF4444", fontSize: 16 }}>
          Please log in to view prescriptions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#10B981", "#059669"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <Text style={styles.headerSubtitle}>
          {prescriptions.length} total prescription
          {prescriptions.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prescriptions, medications, or doctors..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { filter: "all", label: "All", count: filterCounts.all },
            { filter: "active", label: "Active", count: filterCounts.active },
            {
              filter: "completed",
              label: "Completed",
              count: filterCounts.completed,
            },
          ]}
          keyExtractor={(item) => item.filter}
          renderItem={({ item }) =>
            renderFilterButton(
              item.filter as FilterType,
              item.label,
              item.count
            )
          }
          contentContainerStyle={{ gap: 12 }}
        />
      </View>

      {/* Prescriptions List */}
      <FlatList
        data={filteredPrescriptions}
        renderItem={renderPrescriptionCard}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="medication" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No matching prescriptions"
                : "No prescriptions found"}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Your prescriptions will appear here when available"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  countBadgeTextActive: {
    color: "#ffffff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  prescriptionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  diagnosisContainer: {
    marginBottom: 12,
  },
  diagnosisLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 2,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  medicationsCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  medicationsText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  arrowContainer: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default PrescriptionsScreen;
