import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export interface DoctorAppointmentFilters {
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  date?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateAppointmentStatusData {
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
}

class DoctorAppointmentAPI {
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

  async getDoctorAppointments(filters: DoctorAppointmentFilters = {}) {
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
      console.log('Get doctor appointments response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get doctor appointments error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }

  async getDoctorAppointment(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${base_url}/appointments/${id}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get doctor appointment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }

  async updateAppointmentStatus(id: string, data: UpdateAppointmentStatusData) {
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

  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.getDoctorAppointments({ limit: 1000 });
      const appointments = response.appointments || [];
      
      const today = new Date().toDateString();
      
      const stats: AppointmentStats = {
        total: appointments.length,
        pending: appointments.filter((apt: any) => apt.status === 'pending').length,
        confirmed: appointments.filter((apt: any) => apt.status === 'confirmed').length,
        completed: appointments.filter((apt: any) => apt.status === 'completed').length,
        cancelled: appointments.filter((apt: any) => apt.status === 'cancelled').length,
        today: appointments.filter((apt: any) => new Date(apt.appointmentDate).toDateString() === today).length,
      };

      return stats;
    } catch (error: any) {
      console.error('Get appointment stats error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment statistics');
    }
  }
}

export const doctorAppointmentAPI = new DoctorAppointmentAPI();
