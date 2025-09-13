import axios from "axios";
import * as SecureStore from "expo-secure-store";

const base_url =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface SymptomData {
  name: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  duration: string;
  bodyPart?: string;
  description?: string;
}

export interface CreateAssessmentData {
  symptoms: SymptomData[];
  additionalInfo?: {
    medicalHistory?: string[];
    currentMedications?: string[];
    allergies?: string[];
  };
}

class SymptomAssessmentAPI {
  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createAssessment(data: CreateAssessmentData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${base_url}/symptom-assessments`,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error("Create assessment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create assessment"
      );
    }
  }

  async getCommonSymptoms() {
    try {
      const response = await axios.get(
        `${base_url}/symptom-assessments/common-symptoms`
      );
      return response.data;
    } catch (error: any) {
      console.error("Get common symptoms error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch common symptoms"
      );
    }
  }
}

export const symptomAssessmentAPI = new SymptomAssessmentAPI();
