import { useEffect, useState } from 'react';
import { doctorAppointmentAPI, DoctorAppointmentFilters, AppointmentStats } from '../services/doctorAppointmentAPI';
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

export const useDoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthContext();

  const fetchAppointments = async (filters: DoctorAppointmentFilters = {}) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      setLoading(false);
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      setError(null);
      setLoading(true);
      
      const defaultFilters: DoctorAppointmentFilters = {
        limit: 50,
        offset: 0,
        ...filters,
      };

      const response = await doctorAppointmentAPI.getDoctorAppointments(defaultFilters);
      console.log('Get doctor appointments response:', response);
      setAppointments(response.appointments || []);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Fetch doctor appointments error:', error);
      const errorMessage = error.message || 'Failed to fetch appointments';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const statsData = await doctorAppointmentAPI.getAppointmentStats();
      setStats(statsData);
      return { success: true, data: statsData };
    } catch (error: any) {
      console.error('Fetch appointment stats error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshAppointments = async () => {
    await fetchAppointments();
    await fetchStats();
  };

  const getAppointmentById = async (id: string) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await doctorAppointmentAPI.getDoctorAppointment(id);
      return { success: true, data: response.appointment };
    } catch (error: any) {
      console.error('Get appointment error:', error);
      const errorMessage = error.message || 'Failed to fetch appointment';
      return { success: false, error: errorMessage };
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status'], notes?: string) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await doctorAppointmentAPI.updateAppointmentStatus(id, { status, notes });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === id 
            ? { ...apt, status, notes: notes || apt.notes }
            : apt
        )
      );
      
      // Refresh stats
      await fetchStats();
      
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Update appointment status error:', error);
      const errorMessage = error.message || 'Failed to update appointment status';
      return { success: false, error: errorMessage };
    }
  };

  const filterAppointmentsByStatus = (status?: Appointment['status']) => {
    if (!status) return appointments;
    return appointments.filter(appointment => appointment.status === status);
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(appointment => 
      new Date(appointment.appointmentDate).toDateString() === today
    );
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(appointment => 
      new Date(appointment.appointmentDate) > now
    ).sort((a, b) => 
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      fetchAppointments();
      fetchStats();
    }
  }, [isAuthenticated, user?.role]);

  return {
    appointments,
    stats,
    loading,
    error,
    fetchAppointments,
    refreshAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    filterAppointmentsByStatus,
    getTodayAppointments,
    getUpcomingAppointments,
  };
};
