import { useEffect, useState } from 'react';
import { appointmentAPI, AppointmentFilters } from '../services/appointmentAPI';
import { useAuthContext } from '../contexts/AuthContext';

export interface Appointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  doctorPersionalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  doctorProfessionalInfo: {
    _id: string;
    specialization:  {
    name: string;
    certification?: string;
    yearsOfExperience: number;
  }   
    experience: number; 
    rating: {
    average: number;
    totalReviews: number;
  }; 
  };
  appointmentDate: string;
  duration: number;
  type: 'in_person' | 'video_call' | 'phone_call';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  videoCallLink?: string;
  videoCallPlatform?: string;
  prescription?: {
    _id: string;
    medications: Array<{
      name: string;
      dosage: string;
    }>;
  };
  createdAt: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  const fetchAppointments = async (filters: AppointmentFilters = {}) => {
    if (!isAuthenticated) {
      setLoading(false);
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setError(null);
      setLoading(true);
      
      const defaultFilters: AppointmentFilters = {
        limit: 50,
        offset: 0,
        ...filters,
      };

      const response = await appointmentAPI.getUserAppointments(defaultFilters);
      setAppointments(response.appointments || []);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Fetch appointments error:', error);
      const errorMessage = error.message || 'Failed to fetch appointments';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    return fetchAppointments();
  };

  const getAppointmentById = async (id: string) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await appointmentAPI.getAppointment(id);
      return { success: true, data: response.appointment };
    } catch (error: any) {
      console.error('Get appointment error:', error);
      const errorMessage = error.message || 'Failed to fetch appointment';
      return { success: false, error: errorMessage };
    }
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await appointmentAPI.cancelAppointment(id, reason);
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === id 
            ? { ...apt, status: 'cancelled' as const, notes: reason || 'Cancelled by user' }
            : apt
        )
      );
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      const errorMessage = error.message || 'Failed to cancel appointment';
      return { success: false, error: errorMessage };
    }
  };

  const filterAppointments = (filter: 'all' | 'upcoming' | 'past') => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const now = new Date();
      
      switch (filter) {
        case 'upcoming':
          return appointmentDate >= now;
        case 'past':
          return appointmentDate < now;
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    refreshAppointments,
    getAppointmentById,
    cancelAppointment,
    filterAppointments,
  };
};
