import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface DoctorSearchFilters {
  specialization?: string;
  location?: string;
  availability?: string;
  rating?: number;
  limit?: number;
  offset?: number;
}

class DoctorAPI {
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

  async getAllDoctors() {
    try {
      const response = await axios.get(`${base_url}/doctors`);
      return response.data;
    } catch (error: any) {
      console.error('Get all doctors error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }

  async searchDoctors(filters: DoctorSearchFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${base_url}/doctors/search?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Search doctors error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search doctors');
    }
  }

  async getDoctorProfile(id: string) {
    try {
      const response = await axios.get(`${base_url}/doctors/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get doctor profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor profile');
    }
  }

  async updateDoctorProfile(data: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${base_url}/doctors/profile`,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update doctor profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update doctor profile');
    }
  }
}

export const doctorAPI = new DoctorAPI();
