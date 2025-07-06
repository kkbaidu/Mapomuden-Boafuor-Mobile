import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export interface Pharmacy {
  name: string;
  address: string;
  phone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Prescription {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  appointment?: {
    _id: string;
    appointmentDate: string;
  };
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  prescriptionDate: string;
  expiryDate: string;
  pharmacy?: Pharmacy;
  filled: boolean;
  filledDate?: string;
  createdAt: string;
}

export interface CreatePrescriptionData {
  patientId: string;
  appointmentId?: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  expiryDate?: string;
  pharmacy?: Pharmacy;
}

export interface PrescriptionFilters {
  status?: string;
  patientId?: string;
  limit?: number;
  offset?: number;
}

class PrescriptionAPI {
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

  async createPrescription(data: CreatePrescriptionData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${base_url}/prescriptions`,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Create prescription error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create prescription');
    }
  }

  async getDoctorPrescriptions(filters: PrescriptionFilters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${base_url}/prescriptions?${params.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get doctor prescriptions error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }

  async getPrescription(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${base_url}/prescriptions/${id}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get prescription error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch prescription');
    }
  }

  async getPatientPrescriptions(patientId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${base_url}/prescriptions?patientId=${patientId}&limit=100`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get patient prescriptions error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch patient prescriptions');
    }
  }
}

export const prescriptionAPI = new PrescriptionAPI();
