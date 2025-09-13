import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const symptomsList = [
  "Fever",
  "Cough",
  "Shortness of breath",
  "Fatigue",
  "Muscle or body aches",
  "Headache",
  "Loss of taste or smell",
  "Sore throat",
  "Congestion or runny nose",
  "Nausea or vomiting",
  "Diarrhea",
];

export default function SymptomsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Common Symptoms</Text>
      {symptomsList.map((symptom, idx) => (
        <View key={idx} style={styles.symptomItem}>
          <Text style={styles.symptomText}>{symptom}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Report Symptoms</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
  },
  symptomItem: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
  },
  symptomText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    marginTop: 32,
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
