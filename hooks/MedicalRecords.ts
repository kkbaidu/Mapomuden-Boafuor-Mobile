import { useAuthContext } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Alert } from 'react-native';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'; 

interface VitalSigns {
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

interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface MedicalCondition {
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

interface Surgery {
  surgery: string;
  date: string;
  hospital?: string;
  notes?: string;
}

interface Immunization {
  vaccine: string;
  date: string;
  nextDue?: string;
}

interface FamilyHistory {
  relation: string;
  conditions: string[];
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalRecord {
  _id: string;
  patient: string;
  bloodGroup?: string;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  currentMedications: string[];
  pastSurgeries: Surgery[];
  vitalSigns: VitalSigns[];
  immunizations: Immunization[];
  familyHistory: FamilyHistory[];
  emergencyContact?: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

export const useMedicalRecords = () => {
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<string>('');
    const [formData, setFormData] = useState<any>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { token } = useAuthContext();

    const fetchMedicalRecord = async () => {
      try {
        const response = await fetch(`${base_url}/medical-records`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Fix: Extract medicalRecord from the response object
        setMedicalRecord(data.medicalRecord || data);
    
      } catch (error) {
        console.error('Error fetching medical record:', error);
        Alert.alert('Error', 'Failed to load medical record');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    const updateMedicalRecord = async (updateData: any) => {
      try {
        const response = await fetch(`${base_url}/medical-records`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Fix: Extract medicalRecord from the response object
        setMedicalRecord(data.medicalRecord);
        setModalVisible(false);
        setFormData({});
        
        Alert.alert('Success', 'Medical record updated successfully');
      } catch (error) {
        console.error('Error updating medical record:', error);
        Alert.alert('Error', 'Failed to update medical record');
      }
    };

    return {
      fetchMedicalRecord,
      updateMedicalRecord,
      medicalRecord, 
      setMedicalRecord,
      loading, 
      setLoading,
      refreshing, 
      setRefreshing,
      activeTab, 
      setActiveTab,
      modalVisible, 
      setModalVisible,
      modalType, 
      setModalType,
      formData, 
      setFormData,
      showDatePicker, 
      setShowDatePicker
    }
}