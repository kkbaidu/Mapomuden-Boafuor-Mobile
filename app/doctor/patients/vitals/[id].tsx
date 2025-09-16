import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAuthContext } from "../../../../contexts/AuthContext";
import { medicalRecordAPI } from "../../../../services/medicalRecordAPI";

// Stable memoized input component (prevents remount causing cursor loss)
const VitalInput = memo(function VitalInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "numeric",
  suffix,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 8,
          paddingHorizontal: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          style={{ flex: 1, height: 44, fontSize: 16, color: "#111827" }}
          placeholderTextColor="#9CA3AF"
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
        />
        {suffix && (
          <Text style={{ marginLeft: 8, color: "#6B7280" }}>{suffix}</Text>
        )}
      </View>
    </View>
  );
});

export default function AddVitalSignsScreen() {
  const { id: patientId } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuthContext();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stable callbacks (avoid new fn identity each render)
  const onChangeSystolic = useCallback((t: string) => setSystolic(t), []);
  const onChangeDiastolic = useCallback((t: string) => setDiastolic(t), []);
  const onChangeHeartRate = useCallback((t: string) => setHeartRate(t), []);
  const onChangeTemperature = useCallback((t: string) => setTemperature(t), []);
  const onChangeWeight = useCallback((t: string) => setWeight(t), []);
  const onChangeHeight = useCallback((t: string) => setHeight(t), []);
  const onChangeOxygen = useCallback((t: string) => setOxygenSaturation(t), []);

  if (!isAuthenticated || user?.role !== "doctor") {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text style={{ color: "#666", fontSize: 18 }}>Unauthorized</Text>
      </SafeAreaView>
    );
  }

  const computeBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (!isNaN(w) && !isNaN(h) && h > 0) return (w / (h * h)).toFixed(1);
    return "";
  };

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);

      if (!systolic || !diastolic) {
        Alert.alert(
          "Validation",
          "Blood pressure (systolic & diastolic) is required."
        );
        setSubmitting(false);
        return;
      }

      const payload: any = {
        bloodPressure: {
          systolic: parseInt(systolic, 10),
          diastolic: parseInt(diastolic, 10),
        },
      };
      if (heartRate) payload.heartRate = parseInt(heartRate, 10);
      if (temperature) payload.temperature = parseFloat(temperature);
      if (weight) payload.weight = parseFloat(weight);
      if (height) payload.height = parseFloat(height);
      const bmiCalc = computeBMI();
      if (bmiCalc) payload.bmi = parseFloat(bmiCalc);
      if (oxygenSaturation)
        payload.oxygenSaturation = parseInt(oxygenSaturation, 10);

      await medicalRecordAPI.addVitalSigns(patientId as string, payload);
      Alert.alert("Success", "Vital signs added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add vital signs");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
          Add Vital Signs
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
          Enter the patient's latest vital signs. BMI will be auto-calculated.
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Blood Pressure
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <VitalInput
                label="Systolic"
                value={systolic}
                onChangeText={onChangeSystolic}
                placeholder="120"
                suffix="mmHg"
                autoFocus
              />
            </View>
            <View style={{ flex: 1 }}>
              <VitalInput
                label="Diastolic"
                value={diastolic}
                onChangeText={onChangeDiastolic}
                placeholder="80"
                suffix="mmHg"
              />
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Other Vitals
          </Text>
          <VitalInput
            label="Heart Rate"
            value={heartRate}
            onChangeText={onChangeHeartRate}
            placeholder="70"
            suffix="bpm"
          />
          <VitalInput
            label="Temperature"
            value={temperature}
            onChangeText={onChangeTemperature}
            placeholder="36.8"
            suffix="°C"
            keyboardType="decimal-pad"
          />
          <VitalInput
            label="Oxygen Saturation"
            value={oxygenSaturation}
            onChangeText={onChangeOxygen}
            placeholder="98"
            suffix="%"
          />
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Anthropometrics
          </Text>
          <VitalInput
            label="Weight"
            value={weight}
            onChangeText={onChangeWeight}
            placeholder="70"
            suffix="kg"
            keyboardType="decimal-pad"
          />
          <VitalInput
            label="Height"
            value={height}
            onChangeText={onChangeHeight}
            placeholder="175"
            suffix="cm"
            keyboardType="decimal-pad"
          />
          <View style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              BMI:{" "}
              <Text style={{ fontWeight: "600", color: "#2563EB" }}>
                {computeBMI() || "--"}
              </Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#2563EB",
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: submitting ? 0.7 : 1,
            marginBottom: 42,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="save" size={20} color="#fff" />
          )}
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {submitting ? "Saving..." : "Save Vital Signs"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
