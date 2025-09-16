import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { usePatients } from "../../../hooks/usePatients";
import { usePrescriptions } from "../../../hooks/usePrescriptions";
import { useAuthContext } from "../../../contexts/AuthContext";
import { Patient } from "../../../services/patientAPI";
import { Prescription } from "../../../services/prescriptionAPI";

interface PatientStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  lastVisit: string | null;
}

interface PatientData {
  patient: Patient;
  appointments: any[];
  stats: PatientStats;
}

export default function PatientDetails() {
  const { id } = useLocalSearchParams();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "appointments" | "prescriptions" | "records"
  >("overview");

  const { getPatientDetails } = usePatients();
  const { getPatientPrescriptions } = usePrescriptions();
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Fetch patient details
      const patientResult = await getPatientDetails(id as string);
      if (patientResult.success && patientResult.data) {
        setPatientData(patientResult.data);
      }

      // Fetch patient prescriptions
      const prescriptionResult = await getPatientPrescriptions(id as string);
      if (prescriptionResult.success) {
        setPrescriptions(prescriptionResult.data.prescriptions || []);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      Alert.alert("Error", "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleCallPatient = () => {
    if (patientData?.patient.phone) {
      Linking.openURL(`tel:${patientData.patient.phone}`);
    }
  };

  const handleEmailPatient = () => {
    if (patientData?.patient.email) {
      Linking.openURL(`mailto:${patientData.patient.email}`);
    }
  };

  const handleCreatePrescription = () => {
    router.push(`/doctor/prescriptions/create/${id}`);
  };

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/doctor/appointments/${appointmentId}`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#10B981", text: "#FFFFFF" };
      case "confirmed":
        return { bg: "#3B82F6", text: "#FFFFFF" };
      case "pending":
        return { bg: "#F59E0B", text: "#FFFFFF" };
      case "cancelled":
        return { bg: "#EF4444", text: "#FFFFFF" };
      default:
        return { bg: "#6B7280", text: "#FFFFFF" };
    }
  };

  if (!isAuthenticated || user?.role !== "doctor") {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#666", fontSize: 18 }}>Unauthorized</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, fontSize: 16, color: "#666" }}>
          Loading patient details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!patientData) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="person-outline" size={64} color="#D1D5DB" />
        <Text style={{ color: "#666", fontSize: 18, marginTop: 16 }}>
          Patient not found
        </Text>
      </SafeAreaView>
    );
  }

  const { patient, appointments, stats } = patientData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#2563EB",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
              {getInitials(patient.firstName, patient.lastName)}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}
            >
              {patient.firstName} {patient.lastName}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textTransform: "capitalize",
              }}
            >
              {patient.gender} • {patient.bloodGroup || "Unknown blood type"}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {patient.location}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleCallPatient}
              style={{
                backgroundColor: "#10B981",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEmailPatient}
              style={{
                backgroundColor: "#3B82F6",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Ionicons name="mail" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#2563EB" }}
            >
              {stats.totalAppointments}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>Total</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#10B981" }}
            >
              {stats.completedAppointments}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>Completed</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#F59E0B" }}
            >
              {stats.pendingAppointments}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 24, paddingVertical: 12 }}>
            {[
              { key: "overview", label: "Overview" },
              { key: "appointments", label: "Appointments" },
              { key: "prescriptions", label: "Prescriptions" },
              { key: "records", label: "Records" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  borderBottomWidth: 2,
                  borderBottomColor:
                    activeTab === tab.key ? "#2563EB" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: activeTab === tab.key ? "#2563EB" : "#6B7280",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {activeTab === "overview" && (
          <View>
            {/* Contact Information */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Contact Information
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call-outline" size={16} color="#6B7280" />
                  <Text style={{ marginLeft: 8, color: "#374151" }}>
                    {patient.phone}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="mail-outline" size={16} color="#6B7280" />
                  <Text style={{ marginLeft: 8, color: "#374151" }}>
                    {patient.email}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={{ marginLeft: 8, color: "#374151" }}>
                    {patient.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            {patient.emergencyContact && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Emergency Contact
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontWeight: "600", color: "#374151" }}>
                    {patient.emergencyContact.name}
                  </Text>
                  <Text style={{ color: "#6B7280" }}>
                    {patient.emergencyContact.relationship}
                  </Text>
                  <Text style={{ color: "#374151" }}>
                    {patient.emergencyContact.phone}
                  </Text>
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Quick Actions
              </Text>
              <TouchableOpacity
                onPress={handleCreatePrescription}
                style={{
                  backgroundColor: "#2563EB",
                  padding: 16,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="medical-outline" size={20} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Create Prescription
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "appointments" && (
          <View>
            {appointments.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No appointments found
                </Text>
              </View>
            ) : (
              appointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment._id}
                  onPress={() => handleViewAppointment(appointment._id)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {appointment.reason}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          marginBottom: 8,
                        }}
                      >
                        {formatDate(appointment.appointmentDate)} at{" "}
                        {formatTime(appointment.appointmentDate)}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#374151" }}>
                        Type: {appointment.type.replace("_", " ")}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: getStatusColor(appointment.status).bg,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: getStatusColor(appointment.status).text,
                          fontSize: 12,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {appointment.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === "prescriptions" && (
          <View>
            {prescriptions.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No prescriptions found
                </Text>
                <TouchableOpacity
                  onPress={handleCreatePrescription}
                  style={{
                    backgroundColor: "#2563EB",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginTop: 16,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                  >
                    Create First Prescription
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              prescriptions.map((prescription) => (
                <View
                  key={prescription._id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {prescription.diagnosis}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      {formatDate(prescription.prescriptionDate)}
                    </Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    {prescription.medications.map((med, index) => (
                      <Text
                        key={index}
                        style={{ fontSize: 14, color: "#374151" }}
                      >
                        • {med.name} - {med.dosage} ({med.frequency})
                      </Text>
                    ))}
                  </View>
                  {prescription.notes && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        marginTop: 8,
                        fontStyle: "italic",
                      }}
                    >
                      Note: {prescription.notes}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "records" && (
          <View>
            <TouchableOpacity
              onPress={() => router.push(`/doctor/patients/records/${id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#10B981",
                    padding: 12,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="document-text" size={24} color="#fff" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    View Medical Records
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    Vital signs, allergies, conditions
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => router.push(`/doctor/patients/vitals/${id}`)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#3B82F6",
                    padding: 12,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="pulse" size={24} color="#fff" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Add Vital Signs
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    Record patient vital signs
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#F59E0B",
                    padding: 12,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="folder" size={24} color="#fff" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Lab Results
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    View lab test results
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity> */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
