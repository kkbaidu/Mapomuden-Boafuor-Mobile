import { useState, useEffect } from 'react';
import { patientAPI, Patient, PatientFilters } from '../services/patientAPI';
import { useAuthContext } from '../contexts/AuthContext';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { isAuthenticated, user } = useAuthContext();

  const fetchPatients = async (filters: PatientFilters = {}) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      setLoading(false);
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      setError(null);
      setLoading(true);
      
      const response = await patientAPI.getDoctorPatients(filters);
      setPatients(response.patients);
      setTotal(response.total);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Fetch patients error:', error);
      const errorMessage = error.message || 'Failed to fetch patients';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getPatientDetails = async (patientId: string) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await patientAPI.getPatientDetails(patientId);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Get patient details error:', error);
      return { success: false, error: error.message };
    }
  };

  const searchPatients = async (query: string) => {
    return await fetchPatients({ search: query, limit: 20 });
  };

  const refreshPatients = async () => {
    await fetchPatients();
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      fetchPatients();
    }
  }, [isAuthenticated, user?.role]);

  return {
    patients,
    loading,
    error,
    total,
    fetchPatients,
    getPatientDetails,
    searchPatients,
    refreshPatients,
  };
};
