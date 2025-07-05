import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface CreateAppointmentData {
  doctorId: string;
  doctorUserId: string;
  appointmentDate: Date;
  duration?: number;
  type: 'in_person' | 'video_call' | 'phone_call';
  reason: string;
  videoCallLink?: string;
  videoCallPlatform?: 'google_meet' | 'zoom' | 'teams' | 'whatsapp' | 'other';
}

export interface AppointmentFilters {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateStatusData {
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

class AppointmentAPI {
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

  async createAppointment(data: CreateAppointmentData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${base_url}/appointments`,
        {
          ...data,
          appointmentDate: data.appointmentDate.toISOString(),
        },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Create appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  }

  async getUserAppointments(filters: AppointmentFilters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${base_url}/appointments?${params.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get appointments error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }

  async getAppointment(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${base_url}/appointments/${id}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }

  async updateAppointmentStatus(id: string, data: UpdateStatusData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.patch(
        `${base_url}/appointments/${id}/status`,
        data,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update appointment status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  }

  async cancelAppointment(id: string, reason?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.patch(
        `${base_url}/appointments/${id}/cancel`,
        { reason },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
}

export const appointmentAPI = new AppointmentAPI();
