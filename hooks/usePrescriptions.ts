import { useState, useEffect } from 'react';
import { prescriptionAPI, Prescription, CreatePrescriptionData, PrescriptionFilters } from '../services/prescriptionAPI';
import { useAuthContext } from '../contexts/AuthContext';

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthContext();

  const fetchPrescriptions = async (filters: PrescriptionFilters = {}) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      setLoading(false);
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      setError(null);
      setLoading(true);
      
      const response = await prescriptionAPI.getDoctorPrescriptions(filters);
      setPrescriptions(response.prescriptions || []);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Fetch prescriptions error:', error);
      const errorMessage = error.message || 'Failed to fetch prescriptions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async (data: CreatePrescriptionData) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await prescriptionAPI.createPrescription(data);
      
      // Add to local state
      if (response.prescription) {
        setPrescriptions(prev => [response.prescription, ...prev]);
      }
      
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Create prescription error:', error);
      return { success: false, error: error.message };
    }
  };

  const getPrescription = async (id: string) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await prescriptionAPI.getPrescription(id);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Get prescription error:', error);
      return { success: false, error: error.message };
    }
  };

  const getPatientPrescriptions = async (patientId: string) => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      return { success: false, error: 'Not authenticated as doctor' };
    }

    try {
      const response = await prescriptionAPI.getPatientPrescriptions(patientId);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Get patient prescriptions error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshPrescriptions = async () => {
    await fetchPrescriptions();
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      fetchPrescriptions();
    }
  }, [isAuthenticated, user?.role]);

  return {
    prescriptions,
    loading,
    error,
    fetchPrescriptions,
    createPrescription,
    getPrescription,
    getPatientPrescriptions,
    refreshPrescriptions,
  };
};
