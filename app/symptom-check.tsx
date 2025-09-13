import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import {
  symptomAssessmentAPI,
  SymptomData,
  CreateAssessmentData,
} from "../services/symptomAssessmentAPI";

interface CommonSymptom {
  name: string;
  bodyPart: string;
  category: string;
}

const SymptomCheckScreen = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomData[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<CommonSymptom[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [step, setStep] = useState<"symptoms" | "results">("symptoms");

  useEffect(() => {
    loadCommonSymptoms();
  }, []);

  const loadCommonSymptoms = async () => {
    try {
      const response = await symptomAssessmentAPI.getCommonSymptoms();
      setCommonSymptoms(response.symptoms);
    } catch (error) {
      console.error("Error loading symptoms:", error);
    }
  };

  const addSymptom = (symptomName: string) => {
    if (selectedSymptoms.find((s) => s.name === symptomName)) return;

    const newSymptom: SymptomData = {
      name: symptomName,
      severity: "mild",
      duration: "1 day",
      description: "",
    };

    setSelectedSymptoms([...selectedSymptoms, newSymptom]);
  };

  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return;
    addSymptom(customSymptom.trim());
    setCustomSymptom("");
  };

  const removeSymptom = (index: number) => {
    setSelectedSymptoms(selectedSymptoms.filter((_, i) => i !== index));
  };

  const performAssessment = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert("Error", "Please select at least one symptom");
      return;
    }

    setIsLoading(true);
    try {
      const assessmentData: CreateAssessmentData = {
        symptoms: selectedSymptoms,
      };

      const response = await symptomAssessmentAPI.createAssessment(
        assessmentData
      );
      setAssessmentResult(response.assessment);
      setStep("results");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "#EF4444";
      case "high":
        return "#F97316";
      case "medium":
        return "#EAB308";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const renderSymptomSelection = () => (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Check</Text>
      </View> */}

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          What symptoms are you experiencing?
        </Text>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Selected Symptoms</Text>
            {selectedSymptoms.map((symptom, index) => (
              <View key={index} style={styles.selectedSymptomCard}>
                <View style={styles.selectedSymptomHeader}>
                  <Text style={styles.selectedSymptomName}>{symptom.name}</Text>
                  <TouchableOpacity onPress={() => removeSymptom(index)}>
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Custom Symptom Input */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Add Custom Symptom</Text>
          <View style={styles.customSymptomContainer}>
            <TextInput
              style={styles.customSymptomInput}
              placeholder="Describe your symptom..."
              value={customSymptom}
              onChangeText={setCustomSymptom}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={addCustomSymptom}
              style={styles.addButton}
            >
              <Plus size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Common Symptoms */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Common Symptoms</Text>
          <View style={styles.symptomsGrid}>
            {commonSymptoms.map((symptom, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.symptomChip,
                  selectedSymptoms.find((s) => s.name === symptom.name) &&
                    styles.selectedChip,
                ]}
                onPress={() => addSymptom(symptom.name)}
              >
                <Text
                  style={[
                    styles.symptomChipText,
                    selectedSymptoms.find((s) => s.name === symptom.name) &&
                      styles.selectedChipText,
                  ]}
                >
                  {symptom.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSymptoms.length > 0 && (
          <TouchableOpacity
            style={styles.assessButton}
            onPress={performAssessment}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#2563EB", "#10B981"]}
              style={styles.assessButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.assessButtonText}>Get AI Assessment</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderResults = () => {
    if (!assessmentResult) return null;

    const { assessmentResult: result } = assessmentResult;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {/* <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Assessment Results</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Urgency Level */}
          <View
            style={[
              styles.urgencyCard,
              { borderLeftColor: getUrgencyColor(result.urgencyLevel) },
            ]}
          >
            <View style={styles.urgencyHeader}>
              <AlertTriangle
                size={24}
                color={getUrgencyColor(result.urgencyLevel)}
              />
              <Text
                style={[
                  styles.urgencyLevel,
                  { color: getUrgencyColor(result.urgencyLevel) },
                ]}
              >
                {result.urgencyLevel.toUpperCase()} PRIORITY
              </Text>
            </View>
            {result.emergencyWarning && (
              <Text style={styles.emergencyWarning}>
                {result.emergencyWarning}
              </Text>
            )}
          </View>

          {/* Possible Conditions */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Possible Conditions</Text>
            {result.possibleConditions.map(
              (condition: string, index: number) => (
                <View key={index} style={styles.conditionItem}>
                  <Text style={styles.conditionText}>• {condition}</Text>
                </View>
              )
            )}
          </View>

          {/* Recommendations */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Recommendations</Text>
            {result.recommendations.map(
              (recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>
                    • {recommendation}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/appointments")}
            >
              <Text style={styles.actionButtonText}>Book Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {
                setSelectedSymptoms([]);
                setAssessmentResult(null);
                setStep("symptoms");
              }}
            >
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                New Assessment
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  return step === "symptoms" ? renderSymptomSelection() : renderResults();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  selectedSymptomCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedSymptomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedSymptomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  customSymptomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customSymptomInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#1E293B",
  },
  addButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomChip: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  symptomChipText: {
    fontSize: 14,
    color: "#64748B",
  },
  selectedChipText: {
    color: "white",
  },
  assessButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  assessButtonGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  assessButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  urgencyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  urgencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  urgencyLevel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emergencyWarning: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  resultSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resultSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  conditionItem: {
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#64748B",
  },
});

export default SymptomCheckScreen;
