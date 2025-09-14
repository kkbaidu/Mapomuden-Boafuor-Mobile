import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePatients } from "../../../../hooks/usePatients";
import {
  medicalRecordAPI,
  MedicalRecord,
  VitalSigns,
  Allergy,
  MedicalCondition,
} from "../../../../services/medicalRecordAPI";
import { useAuthContext } from "../../../../contexts/AuthContext";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function PatientMedicalRecords() {
  const { patientId } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuthContext();
  const { getPatientDetails } = usePatients();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "vitals" | "allergies" | "conditions" | "medications"
  >("overview");
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showEditVitalModal, setShowEditVitalModal] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalSigns | null>(null);

  // Vital Signs Form State
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSigns>>({
    bloodPressure: { systolic: 0, diastolic: 0 },
    heartRate: 0,
    temperature: 0,
    weight: 0,
    height: 0,
    oxygenSaturation: 0,
  });

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch patient details
      const patientResult = await getPatientDetails(patientId as string);
      if (patientResult.success && patientResult.data) {
        setPatient(patientResult.data.patient);
      }

      // Fetch medical record
      const recordResult = await medicalRecordAPI.getPatientMedicalRecord(
        patientId as string
      );
      if (recordResult.medicalRecord) {
        setMedicalRecord(recordResult.medicalRecord);
      }
    } catch (error) {
      console.error("Error fetching medical data:", error);
      Alert.alert("Error", "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVitalSigns = async () => {
    try {
      await medicalRecordAPI.addVitalSigns(
        patientId as string,
        vitalSigns as VitalSigns
      );
      setShowAddVitalModal(false);
      resetVitalSignsForm();
      await fetchData(); // Refresh data
      Alert.alert("Success", "Vital signs added successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add vital signs");
    }
  };

  const handleEditVitalSigns = async () => {
    try {
      if (!editingVital?._id) return;

      // Create the vital signs object with proper structure
      const vitalSignsToUpdate = {
        bloodPressure: vitalSigns.bloodPressure,
        heartRate: vitalSigns.heartRate,
        temperature: vitalSigns.temperature,
        weight: vitalSigns.weight,
        height: vitalSigns.height,
        oxygenSaturation: vitalSigns.oxygenSaturation,
      };

      await medicalRecordAPI.updateVitalSigns(
        editingVital._id,
        vitalSignsToUpdate,
        patientId as string
      );
      setShowEditVitalModal(false);
      setEditingVital(null);
      resetVitalSignsForm();
      await fetchData(); // Refresh data
      Alert.alert("Success", "Vital signs updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update vital signs");
    }
  };

  const handleDeleteVitalSigns = (vital: VitalSigns) => {
    Alert.alert(
      "Delete Vital Signs",
      `Are you sure you want to delete the vital signs from ${formatDate(
        vital.createdAt || ""
      )}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!vital._id) return;
              await medicalRecordAPI.removeVitalSigns(
                vital._id,
                patientId as string
              );
              await fetchData(); // Refresh data
              Alert.alert("Success", "Vital signs deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete vital signs"
              );
            }
          },
        },
      ]
    );
  };

  const openEditVitalModal = (vital: VitalSigns) => {
    setEditingVital(vital);
    setVitalSigns({
      bloodPressure: vital.bloodPressure || { systolic: 0, diastolic: 0 },
      heartRate: vital.heartRate || 0,
      temperature: vital.temperature || 0,
      weight: vital.weight || 0,
      height: vital.height || 0,
      oxygenSaturation: vital.oxygenSaturation || 0,
    });
    setShowEditVitalModal(true);
  };

  const resetVitalSignsForm = () => {
    setVitalSigns({
      bloodPressure: { systolic: 0, diastolic: 0 },
      heartRate: 0,
      temperature: 0,
      weight: 0,
      height: 0,
      oxygenSaturation: 0,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to render the vital signs form
  const renderVitalSignsForm = () => {
    return (
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Blood Pressure
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                Systolic
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
                value={vitalSigns.bloodPressure?.systolic?.toString() || ""}
                onChangeText={(text) =>
                  setVitalSigns((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...prev.bloodPressure!,
                      systolic: parseInt(text) || 0,
                    },
                  }))
                }
                placeholder="120"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                Diastolic
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
                value={vitalSigns.bloodPressure?.diastolic?.toString() || ""}
                onChangeText={(text) =>
                  setVitalSigns((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...prev.bloodPressure!,
                      diastolic: parseInt(text) || 0,
                    },
                  }))
                }
                placeholder="80"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Heart Rate (bpm)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            value={vitalSigns.heartRate?.toString() || ""}
            onChangeText={(text) =>
              setVitalSigns((prev) => ({
                ...prev,
                heartRate: parseInt(text) || 0,
              }))
            }
            placeholder="70"
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Temperature (°F)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            value={vitalSigns.temperature?.toString() || ""}
            onChangeText={(text) =>
              setVitalSigns((prev) => ({
                ...prev,
                temperature: parseFloat(text) || 0,
              }))
            }
            placeholder="98.6"
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Weight (lbs)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            value={vitalSigns.weight?.toString() || ""}
            onChangeText={(text) =>
              setVitalSigns((prev) => ({
                ...prev,
                weight: parseFloat(text) || 0,
              }))
            }
            placeholder="150"
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Height (inches)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            value={vitalSigns.height?.toString() || ""}
            onChangeText={(text) =>
              setVitalSigns((prev) => ({
                ...prev,
                height: parseFloat(text) || 0,
              }))
            }
            placeholder="68"
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Oxygen Saturation (%)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            value={vitalSigns.oxygenSaturation?.toString() || ""}
            onChangeText={(text) =>
              setVitalSigns((prev) => ({
                ...prev,
                oxygenSaturation: parseInt(text) || 0,
              }))
            }
            placeholder="98"
            keyboardType="numeric"
          />
        </View>
      </View>
    );
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, fontSize: 16, color: "#666" }}>
          Loading medical records...
        </Text>
      </SafeAreaView>
    );
  }

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

        {patient && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#007AFF",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                {getInitials(patient.firstName, patient.lastName)}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}
              >
                {patient.firstName} {patient.lastName}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Medical Records
              </Text>
            </View>
          </View>
        )}
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
              { key: "vitals", label: "Vital Signs" },
              { key: "allergies", label: "Allergies" },
              { key: "conditions", label: "Conditions" },
              { key: "medications", label: "Medications" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  borderBottomWidth: 2,
                  borderBottomColor:
                    activeTab === tab.key ? "#007AFF" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: activeTab === tab.key ? "#007AFF" : "#6B7280",
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
            {/* Basic Information */}
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
                Basic Information
              </Text>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6B7280" }}>Blood Group:</Text>
                  <Text style={{ color: "#374151", fontWeight: "500" }}>
                    {medicalRecord?.bloodGroup || "Not specified"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6B7280" }}>Allergies:</Text>
                  <Text style={{ color: "#374151", fontWeight: "500" }}>
                    {medicalRecord?.allergies?.length || 0}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6B7280" }}>Medical Conditions:</Text>
                  <Text style={{ color: "#374151", fontWeight: "500" }}>
                    {medicalRecord?.medicalConditions?.length || 0}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6B7280" }}>Current Medications:</Text>
                  <Text style={{ color: "#374151", fontWeight: "500" }}>
                    {medicalRecord?.currentMedications?.length || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Vital Signs */}
            {medicalRecord?.vitalSigns &&
              medicalRecord.vitalSigns.length > 0 && (
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
                    Latest Vital Signs
                  </Text>
                  {(() => {
                    const latest =
                      medicalRecord.vitalSigns[
                        medicalRecord.vitalSigns.length - 1
                      ];
                    return (
                      <View style={{ gap: 8 }}>
                        {latest.bloodPressure && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: "#6B7280" }}>
                              Blood Pressure:
                            </Text>
                            <Text
                              style={{ color: "#374151", fontWeight: "500" }}
                            >
                              {latest.bloodPressure.systolic}/
                              {latest.bloodPressure.diastolic} mmHg
                            </Text>
                          </View>
                        )}
                        {latest.heartRate && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: "#6B7280" }}>
                              Heart Rate:
                            </Text>
                            <Text
                              style={{ color: "#374151", fontWeight: "500" }}
                            >
                              {latest.heartRate} bpm
                            </Text>
                          </View>
                        )}
                        {latest.temperature && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: "#6B7280" }}>
                              Temperature:
                            </Text>
                            <Text
                              style={{ color: "#374151", fontWeight: "500" }}
                            >
                              {latest.temperature}°F
                            </Text>
                          </View>
                        )}
                        {latest.weight && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ color: "#6B7280" }}>Weight:</Text>
                            <Text
                              style={{ color: "#374151", fontWeight: "500" }}
                            >
                              {latest.weight} lbs
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              )}
          </View>
        )}

        {activeTab === "vitals" && (
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}
              >
                Vital Signs
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddVitalModal(true)}
                style={{
                  backgroundColor: "#007AFF",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {medicalRecord?.vitalSigns &&
            medicalRecord.vitalSigns.length > 0 ? (
              [...medicalRecord.vitalSigns].reverse().map((vital, index) => (
                <View
                  key={vital._id || index}
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
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6B7280" }}>
                      {formatDate(vital.createdAt || "")}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => openEditVitalModal(vital)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="pencil" size={16} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteVitalSigns(vital)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="trash" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    {vital.bloodPressure && (
                      <Text style={{ color: "#374151" }}>
                        Blood Pressure: {vital.bloodPressure.systolic}/
                        {vital.bloodPressure.diastolic} mmHg
                      </Text>
                    )}
                    {vital.heartRate && (
                      <Text style={{ color: "#374151" }}>
                        Heart Rate: {vital.heartRate} bpm
                      </Text>
                    )}
                    {vital.temperature && (
                      <Text style={{ color: "#374151" }}>
                        Temperature: {vital.temperature}°F
                      </Text>
                    )}
                    {vital.weight && (
                      <Text style={{ color: "#374151" }}>
                        Weight: {vital.weight} lbs
                      </Text>
                    )}
                    {vital.height && (
                      <Text style={{ color: "#374151" }}>
                        Height: {vital.height} in
                      </Text>
                    )}
                    {vital.oxygenSaturation && (
                      <Text style={{ color: "#374151" }}>
                        Oxygen Saturation: {vital.oxygenSaturation}%
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="pulse-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No vital signs recorded
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "allergies" && (
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Allergies
            </Text>
            {medicalRecord?.allergies && medicalRecord.allergies.length > 0 ? (
              medicalRecord.allergies.map((allergy, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {allergy.allergen}
                  </Text>
                  <Text style={{ color: "#6B7280", marginBottom: 4 }}>
                    Reaction: {allergy.reaction}
                  </Text>
                  <View
                    style={{
                      backgroundColor:
                        allergy.severity === "severe" ||
                        allergy.severity === "critical"
                          ? "#FEF2F2"
                          : "#FEF3C7",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          allergy.severity === "severe" ||
                          allergy.severity === "critical"
                            ? "#DC2626"
                            : "#D97706",
                        fontSize: 12,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {allergy.severity}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="warning-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No allergies recorded
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "conditions" && (
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Medical Conditions
            </Text>
            {medicalRecord?.medicalConditions &&
            medicalRecord.medicalConditions.length > 0 ? (
              medicalRecord.medicalConditions.map((condition, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {condition.condition}
                  </Text>
                  <Text style={{ color: "#6B7280", marginBottom: 4 }}>
                    Diagnosed: {formatDate(condition.diagnosedDate)}
                  </Text>
                  <View
                    style={{
                      backgroundColor:
                        condition.status === "active"
                          ? "#FEF2F2"
                          : condition.status === "chronic"
                          ? "#FEF3C7"
                          : "#F0FDF4",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          condition.status === "active"
                            ? "#DC2626"
                            : condition.status === "chronic"
                            ? "#D97706"
                            : "#059669",
                        fontSize: 12,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {condition.status}
                    </Text>
                  </View>
                  {condition.notes && (
                    <Text
                      style={{
                        color: "#6B7280",
                        marginTop: 8,
                        fontStyle: "italic",
                      }}
                    >
                      Note: {condition.notes}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No medical conditions recorded
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "medications" && (
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Current Medications
            </Text>
            {medicalRecord?.currentMedications &&
            medicalRecord.currentMedications.length > 0 ? (
              medicalRecord.currentMedications.map((medication, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {medication}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8 }}>
                  No current medications recorded
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Vital Signs Modal */}
      <Modal
        visible={showAddVitalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddVitalModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <TouchableOpacity onPress={() => setShowAddVitalModal(false)}>
              <Text style={{ color: "#007AFF", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Add Vital Signs
            </Text>
            <TouchableOpacity onPress={handleAddVitalSigns}>
              <Text
                style={{ color: "#007AFF", fontSize: 16, fontWeight: "600" }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {renderVitalSignsForm()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Vital Signs Modal */}
      <Modal
        visible={showEditVitalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditVitalModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <TouchableOpacity onPress={() => setShowEditVitalModal(false)}>
              <Text style={{ color: "#007AFF", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Edit Vital Signs
            </Text>
            <TouchableOpacity onPress={handleEditVitalSigns}>
              <Text
                style={{ color: "#007AFF", fontSize: 16, fontWeight: "600" }}
              >
                Update
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {renderVitalSignsForm()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
