import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface VitalSigns {
  _id?: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygenSaturation?: number;
  createdAt?: string;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
}

export interface MedicalCondition {
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface MedicalRecord {
  _id: string;
  patient: string;
  bloodGroup?: string;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  currentMedications: string[];
  pastSurgeries: {
    surgery: string;
    date: string;
    hospital?: string;
    notes?: string;
  }[];
  vitalSigns: VitalSigns[];
  immunizations: {
    vaccine: string;
    date: string;
    nextDue?: string;
  }[];
  familyHistory: {
    relation: string;
    conditions: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

class MedicalRecordAPI {
  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getPatientMedicalRecord(patientId: string) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Use the new doctor endpoint to view patient records
      const response = await axios.get(
        `${base_url}/medical-records/patient/${patientId}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get patient medical record error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch patient medical record');
    }
  }

  async getMedicalRecord() {
    try {
      const headers = await this.getAuthHeaders();
      
      // For patients viewing their own records
      const response = await axios.get(
        `${base_url}/medical-records`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get medical record error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch medical record');
    }
  }

  async addVitalSigns(patientId: string, vitalSigns: Omit<VitalSigns, '_id' | 'createdAt'>) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Add patient ID to headers for doctors
      const requestHeaders = {
        ...headers,
        'X-Patient-ID': patientId
      };

      const response = await axios.post(
        `${base_url}/medical-records/vital-signs`,
        vitalSigns,
        { headers: requestHeaders }
      );
      return response.data;
    } catch (error: any) {
      console.error('Add vital signs error:', error);
      throw new Error(error.response?.data?.message || 'Failed to add vital signs');
    }
  }

  async updateVitalSigns(vitalSignsId: string, vitalSigns: Omit<VitalSigns, '_id' | 'createdAt'>, patientId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Add patient ID to headers if provided (for doctors)
      const requestHeaders = patientId ? {
        ...headers,
        'X-Patient-ID': patientId
      } : headers;

      const response = await axios.put(
        `${base_url}/medical-records/vital-signs`,
        { 
          vitalSignsId,
          updatedVitalSigns: vitalSigns
        },
        { headers: requestHeaders }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update vital signs error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update vital signs');
    }
  }

  async removeVitalSigns(vitalSignsId: string, patientId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Add patient ID to headers if provided (for doctors)
      const requestHeaders = patientId ? {
        ...headers,
        'X-Patient-ID': patientId
      } : headers;

      const response = await axios.delete(
        `${base_url}/medical-records/vital-signs/${vitalSignsId}`,
        { headers: requestHeaders }
      );
      return response.data;
    } catch (error: any) {
      console.error('Remove vital signs error:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove vital signs');
    }
  }

  async updateMedicalRecord(patientId: string, data: Partial<MedicalRecord>) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${base_url}/medical-records`,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update medical record error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update medical record');
    }
  }
}

export const medicalRecordAPI = new MedicalRecordAPI();
