import { useAuthContext } from '@/contexts/AuthContext';
import { useMedicalRecordsContext } from '@/contexts/MedicalRecordsContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Types based on your backend models
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

interface MedicalRecord {
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

export default function MedicalHistoryScreen() {
  const {
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
   } = useMedicalRecordsContext();
  const { token, user } = useAuthContext();

  useEffect(() => {
    fetchMedicalRecord();
    console.log(user)
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedicalRecord();
  };

  const openAddModal = (type: string) => {
    setModalType(type);
    setFormData({});
    setModalVisible(true);
  };

  // Delete function for array items
  const handleDeleteItem = (type: string, index: number) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteItem(type, index)
        }
      ]
    );
  };

  const deleteItem = (type: string, index: number) => {
    if (!medicalRecord) {
      Alert.alert('Error', 'Medical record not found');
      return;
    }

    // Create a deep copy to avoid mutation
    let updateData = JSON.parse(JSON.stringify(medicalRecord));

    switch (type) {
      case 'allergy':
        updateData.allergies.splice(index, 1);
        break;
      case 'condition':
        updateData.medicalConditions.splice(index, 1);
        break;
      case 'medication':
        updateData.currentMedications.splice(index, 1);
        break;
      case 'vital':
        // For vitals, we need to use the dedicated delete endpoint
        deleteVitalSigns(index);
        return;
      default:
        Alert.alert('Error', 'Unknown item type');
        return;
    }

    updateMedicalRecord(updateData);
  };

  // Delete vital signs using dedicated endpoint
  const deleteVitalSigns = async (index: number) => {
    try {
      const vitalId = medicalRecord?.vitalSigns[index]._id;
      if (!vitalId) {
        Alert.alert('Error', 'Vital signs ID not found');
        return;
      }

      const response = await fetch(`${base_url}/medical-records/vital-signs/${vitalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Refresh the medical record to show updated vital signs
        fetchMedicalRecord();
        Alert.alert('Success', 'Vital signs deleted successfully');
      } else {
        throw new Error('Failed to delete vital signs');
      }
    } catch (error) {
      console.error('Error deleting vital signs:', error);
      Alert.alert('Error', 'Failed to delete vital signs');
    }
  };

  const handleSave = () => {
  // Add validation to prevent the error
  if (!medicalRecord) {
    Alert.alert('Error', 'Medical record not found');
    return;
  }

  // Validate form data based on modal type
  if (!validateFormData()) {
    return;
  }

  // Create a deep copy to avoid mutation
  let updateData = JSON.parse(JSON.stringify(medicalRecord));

  switch (modalType) {
    case 'allergy':
      if (!updateData.allergies) updateData.allergies = [];
      updateData.allergies = [...updateData.allergies, formData];
      break;
    case 'condition':
      if (!updateData.medicalConditions) updateData.medicalConditions = [];
      updateData.medicalConditions = [...updateData.medicalConditions, formData];
      break;
    case 'medication':
      if (!updateData.currentMedications) updateData.currentMedications = [];
      updateData.currentMedications = [...updateData.currentMedications, formData.medication];
      break;
    case 'surgery':
      if (!updateData.pastSurgeries) updateData.pastSurgeries = [];
      updateData.pastSurgeries = [...updateData.pastSurgeries, formData];
      break;
    case 'immunization':
      if (!updateData.immunizations) updateData.immunizations = [];
      updateData.immunizations = [...updateData.immunizations, formData];
      break;
    case 'familyHistory':
      if (!updateData.familyHistory) updateData.familyHistory = [];
      updateData.familyHistory = [...updateData.familyHistory, formData];
      break;
    case 'vitals':
      // Handle vitals separately using the dedicated endpoint
      handleAddVitalSigns();
      return;
    default:
      Alert.alert('Error', 'Unknown form type');
      return;
  }

  updateMedicalRecord(updateData);
};


const validateFormData = (): boolean => {
  switch (modalType) {
    case 'allergy':
      if (!formData.allergen || !formData.reaction || !formData.severity) {
        Alert.alert('Error', 'Please fill in all allergy fields');
        return false;
      }
      break;
    case 'condition':
      if (!formData.condition || !formData.diagnosedDate || !formData.status) {
        Alert.alert('Error', 'Please fill in all condition fields');
        return false;
      }
      break;
    case 'medication':
      if (!formData.medication) {
        Alert.alert('Error', 'Please enter medication name');
        return false;
      }
      break;
    // Add more validations as needed
  }
  return true;
};


const handleAddVitalSigns = async () => {
  try {
    const response = await fetch(`${base_url}/medical-records/vital-signs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Refresh the medical record to show new vital signs
      fetchMedicalRecord();
      setModalVisible(false);
      setFormData({});
    } else {
      throw new Error('Failed to add vital signs');
    }
  } catch (error) {
    console.error('Error adding vital signs:', error);
    Alert.alert('Error', 'Failed to add vital signs');
  }
};

  const TabButton = ({ id, title, icon }: { id: string; title: string; icon: string }) => {
  const isActive = activeTab === id;
  
  return (
    <TouchableOpacity
      onPress={() => setActiveTab(id)}
      className={`relative px-6 py-4 mr-3 rounded-2xl transition-all duration-200 h-[300px] ${
        isActive 
          ? 'bg-blue-600 shadow-lg' 
          : 'bg-white border border-gray-100'
      }`}
      style={{
        shadowColor: isActive ? '#2563EB' : '#000',
        shadowOffset: { width: 0, height: isActive ? 6 : 2 },
        shadowOpacity: isActive ? 0.3 : 0.05,
        shadowRadius: isActive ? 12 : 4,
        elevation: isActive ? 8 : 2,
      }}
    >
      {/* Animated Background Pulse for Active State */}
      {isActive && (
        <View className="absolute inset-0 rounded-2xl bg-blue-400 opacity-20 animate-pulse" />
      )}
      
      <View className="flex-row items-center">
        {/* Icon with Animated Container */}
        <View className={`rounded-xl p-2.5 mr-3 transition-all duration-200 ${
          isActive 
            ? 'bg-white/20 scale-110' 
            : 'bg-gray-50'
        }`}>
          <Ionicons
            name={icon as any}
            size={18}
            color={isActive ? '#ffffff' : '#6B7280'}
          />
        </View>
        
        {/* Text with Better Typography */}
        <Text
          className={`font-semibold transition-all duration-200 ${
            isActive 
              ? 'text-white text-base' 
              : 'text-gray-600 text-sm'
          }`}
        >
          {title}
        </Text>
        
        {/* Active State Indicator */}
        {isActive && (
          <View className="ml-2 w-2 h-2 bg-white rounded-full opacity-80" />
        )}
      </View>
      
      {/* Bottom Border for Active State */}
      {isActive && (
        <View className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/60 rounded-t-full" />
      )}
    </TouchableOpacity>
  );
};

  const SectionCard = ({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) => (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
        {onAdd && (
          <TouchableOpacity
            onPress={onAdd}
            className="bg-blue-50 p-2 rounded-full"
          >
            <Ionicons name="add" size={20} color="#2563EB" />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );

  const EmptyState = ({ message, icon }: { message: string; icon: string }) => (
    <View className="items-center py-8">
      <Ionicons name={icon as any} size={48} color="#9CA3AF" />
      <Text className="text-gray-500 text-center mt-3">{message}</Text>
    </View>
  );

  const renderOverview = () => (
  <View className="">
    {/* Welcome Header */}
    <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm ">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName || 'Patient'}
          </Text>
          <Text className="text-gray-600">
            Here's your health overview for today
          </Text>
        </View>
        <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4">
          <Ionicons name="heart" size={28} color="white" />
        </View>
      </View>
    </View>

    {/* Enhanced Quick Stats Grid */}
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-800 mb-4 px-2">Health Summary</Text>
      <View className="flex-row flex-wrap justify-between">
        {/* Vital Records Card */}
        <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-5 w-[48%] mb-4 shadow-lg border border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <View className="rounded-2xl p-3">
              <Ionicons name="pulse" size={24} color="#3b82f6" />
            </View>
            <View className="bg-white/10 rounded-full px-3 py-1">
              <Text className="text-gray-900 text-xs font-medium">VITALS</Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-500 mb-1">
            {medicalRecord?.vitalSigns?.length || 0}
          </Text>
          <Text className="text-gray-500 text-sm">
            Vital Records
          </Text>
          <View className="mt-3 pt-3 border-t border-white/20">
            <Text className="text-gray-500 text-xs">
              {(medicalRecord?.vitalSigns?.length ?? 0) > 0 
                ? `Last updated ${new Date(medicalRecord?.vitalSigns?.[medicalRecord?.vitalSigns?.length - 1]?.createdAt || '').toLocaleDateString()}`
                : 'No records yet'
              }
            </Text>
          </View>
        </View>

        {/* Medications Card */}
        <View className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 w-[48%] mb-4 shadow-lg border border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-white/20 rounded-2xl p-3">
              <Ionicons name="medical" size={24} color="#a855f7" />
            </View>
            <View className="bg-white/10 rounded-full px-3 py-1">
              <Text className="text-gray-900 text-xs font-medium">MEDS</Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-500 mb-1">
            {medicalRecord?.currentMedications?.length || 0}
          </Text>
          <Text className="text-gray-500 text-sm">
            Active Medications
          </Text>
          <View className="mt-3 pt-3 border-t border-white/20">
            <Text className="text-gray-500 text-xs">
              {(medicalRecord?.currentMedications?.length ?? 0) > 0 
                ? 'Currently taking'
                : 'None prescribed'
              }
            </Text>
          </View>
        </View>

        {/* Allergies Card */}
        <View className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-5 w-[48%] mb-4 shadow-lg border border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-white/20 rounded-2xl p-3">
              <Ionicons name="warning" size={24} color="#f97316" />
            </View>
            <View className="bg-white/10 rounded-full px-3 py-1">
              <Text className="text-gray-900 text-xs font-medium">ALERTS</Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-500 mb-1">
            {medicalRecord?.allergies?.length || 0}
          </Text>
          <Text className="text-gray-500 text-sm">
            Known Allergies
          </Text>
          <View className="mt-3 pt-3 border-t border-white/20">
            <Text className="text-gray-500 text-xs">
              {medicalRecord?.allergies?.some(a => a.severity === 'severe')
                ? 'Severe allergies present'
                : (medicalRecord?.allergies?.length ?? 0) > 0
                ? 'Mild to moderate'
                : 'No known allergies'
              }
            </Text>
          </View>
        </View>

        {/* Medical Conditions Card */}
        <View className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 w-[48%] mb-4 shadow-lg border border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <View className="rounded-2xl p-3">
              <Ionicons name="fitness" size={24} color="#ef4444" />
            </View>
            <View className="bg-white/10 rounded-full px-3 py-1">
              <Text className="text-gray-900 text-xs font-medium">CONDITIONS</Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-500 mb-1">
            {medicalRecord?.medicalConditions?.length || 0}
          </Text>
          <Text className="text-gray-500 text-sm">
            Medical Conditions
          </Text>
          <View className="mt-3 pt-3 border-t border-white/20">
            <Text className="text-gray-500 text-xs">
              {medicalRecord?.medicalConditions?.filter(c => c.status === 'active').length || 0} active conditions
            </Text>
          </View>
        </View>
      </View>
    </View>

    {/* Blood Group & Emergency Contact Row */}
    <View className="flex-row justify-between mb-6">
      {/* Blood Group */}
      {medicalRecord?.bloodGroup && (
        <View className="bg-white rounded-3xl p-6 w-[48%] shadow-sm">
          <View className="items-center">
            <View className="bg-red-50 rounded-full p-4 mb-4">
              <Ionicons name="water" size={32} color="#DC2626" />
            </View>
            <Text className="text-sm text-gray-600 mb-2">Blood Type</Text>
            <Text className="text-3xl font-bold text-red-600">
              {medicalRecord.bloodGroup}
            </Text>
          </View>
        </View>
      )}

      {/* Emergency Contact Preview */}
      {medicalRecord?.emergencyContact && (
        <View className="bg-white rounded-3xl p-6 w-[48%] shadow-sm">
          <View className="items-center">
            <View className="bg-blue-50 rounded-full p-4 mb-4">
              <Ionicons name="call" size={32} color="#2563EB" />
            </View>
            <Text className="text-sm text-gray-600 mb-1">Emergency Contact</Text>
            <Text className="font-bold text-gray-800 text-center text-sm">
              {medicalRecord.emergencyContact.name}
            </Text>
            <Text className="text-xs text-gray-500 text-center">
              {medicalRecord.emergencyContact.relationship}
            </Text>
          </View>
        </View>
      )}
    </View>

    {/* Latest Vital Signs - Enhanced */}
    {medicalRecord?.vitalSigns && medicalRecord.vitalSigns.length > 0 && (
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xl font-bold text-gray-800">Latest Vital Signs</Text>
            <Text className="text-gray-600 text-sm">
              Recorded {new Date(medicalRecord.vitalSigns[medicalRecord.vitalSigns.length - 1].createdAt || '').toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-50 rounded-2xl p-3"
            onPress={() => setActiveTab('vitals')}
          >
            <Ionicons name="trending-up" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {medicalRecord.vitalSigns.slice(-1).map((vital, index) => (
          <View key={index} className="space-y-4">
            <View className="flex-row flex-wrap justify-between">
              {vital.bloodPressure && (
                <View className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 w-[48%] mb-3 border border-red-100">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-red-100 rounded-full p-2 mr-3">
                      <Ionicons name="heart" size={16} color="#DC2626" />
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Blood Pressure</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">
                    {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                  </Text>
                  <Text className="text-gray-500 text-xs">mmHg</Text>
                </View>
              )}

              {vital.heartRate && (
                <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 w-[48%] mb-3 border border-blue-100">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-blue-100 rounded-full p-2 mr-3">
                      <Ionicons name="pulse" size={16} color="#2563EB" />
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Heart Rate</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">
                    {vital.heartRate}
                  </Text>
                  <Text className="text-gray-500 text-xs">bpm</Text>
                </View>
              )}

              {vital.temperature && (
                <View className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 w-[48%] mb-3 border border-orange-100">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-orange-100 rounded-full p-2 mr-3">
                      <Ionicons name="thermometer" size={16} color="#EA580C" />
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Temperature</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">
                    {vital.temperature}°
                  </Text>
                  <Text className="text-gray-500 text-xs">Celsius</Text>
                </View>
              )}

              {vital.weight && (
                <View className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 w-[48%] mb-3 border border-green-100">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-green-100 rounded-full p-2 mr-3">
                      <Ionicons name="fitness" size={16} color="#059669" />
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Weight</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800 mb-1">
                    {vital.weight}
                  </Text>
                  <Text className="text-gray-500 text-xs">kg</Text>
                </View>
              )}
            </View>

            {/* Health Status Indicator */}
            <View className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200">
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800 mb-1">Health Status</Text>
                  <Text className="text-sm text-gray-600">
                    Your latest vitals look normal. Keep up the good work!
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    )}

    {/* Quick Actions */}
    <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
      <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
      <View className="flex-row justify-between">
        <TouchableOpacity 
          className="bg-blue-50 rounded-2xl p-4 items-center flex-1 mr-2"
          onPress={() => openAddModal('vitals')}
        >
          <View className="bg-blue-100 rounded-full p-3 mb-2">
            <Ionicons name="add" size={20} color="#2563EB" />
          </View>
          <Text className="text-blue-700 font-medium text-xs text-center">Add Vitals</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-green-50 rounded-2xl p-4 items-center flex-1 mx-1"
          onPress={() => openAddModal('medication')}
        >
          <View className="bg-green-100 rounded-full p-3 mb-2">
            <Ionicons name="medical" size={20} color="#059669" />
          </View>
          <Text className="text-green-700 font-medium text-xs text-center">Add Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-orange-50 rounded-2xl p-4 items-center flex-1 ml-2"
          onPress={() => openAddModal('allergy')}
        >
          <View className="bg-orange-100 rounded-full p-3 mb-2">
            <Ionicons name="warning" size={20} color="#EA580C" />
          </View>
          <Text className="text-orange-700 font-medium text-xs text-center">Add Allergy</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Health Tips */}
    <View className="bg-gradient-to-br from-purple-500 to-pink-500 bg-red-400 rounded-3xl p-6 mb-10 shadow-lg">
      <View className="flex-row items-center mb-4">
        <View className="bg-white/20 rounded-2xl p-3 mr-4">
          <Ionicons name="bulb" size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Health Tip of the Day</Text>
          <Text className="text-purple-100 text-sm">Stay healthy, stay happy</Text>
        </View>
      </View>
      <Text className="text-white text-sm leading-relaxed">
        Regular monitoring of your vital signs helps in early detection of health issues. 
        Remember to take your medications on time and maintain a balanced diet.
      </Text>
    </View>
  </View>
);

// Add delete buttons to renderConditions - Replace the existing renderConditions function
const renderAllergies = () => (
  <SectionCard title="Allergies" onAdd={() => openAddModal('allergy')}>
    {medicalRecord?.allergies && medicalRecord.allergies.length > 0 ? (
      <View className="space-y-3 gap-y-2">
        {medicalRecord.allergies.map((allergy, index) => (
          <View key={index} className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{allergy.allergen}</Text>
                <Text className="text-gray-600 text-sm mt-1">{allergy.reaction}</Text>
              </View>
              <View className="flex-row items-center">
                <View className={`px-3 py-1 rounded-full mr-2 ${
                  allergy.severity === 'severe' ? 'bg-red-100' :
                  allergy.severity === 'moderate' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    allergy.severity === 'severe' ? 'text-red-800' :
                    allergy.severity === 'moderate' ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {allergy.severity.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteItem('allergy', index)}
                  className="bg-red-100 p-2 rounded-full"
                >
                  <Ionicons name="trash" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <EmptyState message="No allergies recorded" icon="shield-checkmark" />
    )}
  </SectionCard>
);

const renderConditions = () => (
  <SectionCard title="Medical Conditions" onAdd={() => openAddModal('condition')}>
    {medicalRecord?.medicalConditions && medicalRecord.medicalConditions.length > 0 ? (
      <View className="space-y-3 gap-y-2">
        {medicalRecord.medicalConditions.map((condition, index) => (
          <View key={index} className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{condition.condition}</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                </Text>
                {condition.notes && (
                  <Text className="text-gray-600 text-sm mt-2">{condition.notes}</Text>
                )}
              </View>
              <View className="flex-row items-center">
                <View className={`px-3 py-1 rounded-full mr-2 ${
                  condition.status === 'active' ? 'bg-red-100' :
                  condition.status === 'chronic' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    condition.status === 'active' ? 'text-red-800' :
                    condition.status === 'chronic' ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {condition.status.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteItem('condition', index)}
                  className="bg-red-100 p-2 rounded-full"
                >
                  <Ionicons name="trash" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <EmptyState message="No medical conditions recorded" icon="medical" />
    )}
  </SectionCard>
);

// Add delete buttons to renderMedications - Replace the existing renderMedications function

const renderMedications = () => (
  <SectionCard title="Current Medications" onAdd={() => openAddModal('medication')}>
    {medicalRecord?.currentMedications && medicalRecord.currentMedications.length > 0 ? (
      <View className="space-y-3 gap-y-2">
        {medicalRecord.currentMedications.map((medication, index) => (
          <View key={index} className="bg-green-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold text-gray-800 flex-1">{medication}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteItem('medication', index)}
                className="bg-red-100 p-2 rounded-full ml-3"
              >
                <Ionicons name="trash" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <EmptyState message="No current medications" icon="medical" />
    )}
  </SectionCard>
);

// Add delete buttons to renderVitals - Replace the existing renderVitals function

const renderVitals = () => (
  <SectionCard title="Vital Signs History" onAdd={() => openAddModal('vitals')}>
    {medicalRecord?.vitalSigns && medicalRecord.vitalSigns.length > 0 ? (
      <View className="space-y-4 gap-y-4">
        {medicalRecord.vitalSigns.slice().reverse().map((vital, index) => (
          <View key={index} className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-gray-600 text-sm font-medium">
                {vital.createdAt && new Date(vital.createdAt).toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteItem('vital', medicalRecord.vitalSigns.length - 1 - index)}
                className="bg-red-100 p-1.5 rounded-full"
              >
                <Ionicons name="trash" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
            <View className="grid grid-cols-2 gap-4">
              {vital.bloodPressure && (
                <View className="bg-white rounded-lg p-3">
                  <Text className="text-gray-600 text-sm">Blood Pressure</Text>
                  <Text className="font-bold text-lg">
                    {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                  </Text>
                  <Text className="text-gray-500 text-xs">mmHg</Text>
                </View>
              )}
              {vital.heartRate && (
                <View className="bg-white rounded-lg p-3">
                  <Text className="text-gray-600 text-sm">Heart Rate</Text>
                  <Text className="font-bold text-lg">{vital.heartRate}</Text>
                  <Text className="text-gray-500 text-xs">bpm</Text>
                </View>
              )}
              {vital.temperature && (
                <View className="bg-white rounded-lg p-3">
                  <Text className="text-gray-600 text-sm">Temperature</Text>
                  <Text className="font-bold text-lg">{vital.temperature}</Text>
                  <Text className="text-gray-500 text-xs">°C</Text>
                </View>
              )}
              {vital.weight && (
                <View className="bg-white rounded-lg p-3">
                  <Text className="text-gray-600 text-sm">Weight</Text>
                  <Text className="font-bold text-lg">{vital.weight}</Text>
                  <Text className="text-gray-500 text-xs">kg</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    ) : (
      <EmptyState message="No vital signs recorded" icon="pulse" />
    )}
  </SectionCard>
);

  const renderAddModal = () => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => setModalVisible(false)}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        />
        
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Add {modalType}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            className="mb-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {modalType === 'allergy' && (
              <View className="space-y-4 gap-y-4">
                <TextInput
                  placeholder="Allergen"
                  value={formData.allergen || ''}
                  onChangeText={(text) => setFormData({...formData, allergen: text})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Reaction"
                  value={formData.reaction || ''}
                  onChangeText={(text) => setFormData({...formData, reaction: text})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  returnKeyType="done"
                />
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Severity</Text>
                  <View className="flex-row space-x-2 gap-x-2">
                    {['mild', 'moderate', 'severe'].map((severity) => (
                      <TouchableOpacity
                        key={severity}
                        onPress={() => setFormData({...formData, severity})}
                        className={`flex-1 p-3 rounded-xl ${
                          formData.severity === severity ? 'bg-blue-600' : 'bg-gray-100'
                        }`}
                      >
                        <Text className={`text-center font-medium ${
                          formData.severity === severity ? 'text-white' : 'text-gray-600'
                        }`}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {modalType === 'condition' && (
              <View className="space-y-4 gap-y-4">
                <TextInput
                  placeholder="Medical Condition"
                  value={formData.condition || ''}
                  onChangeText={(text) => setFormData({...formData, condition: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                
                {/* Replace the diagnosedDate TextInput with this date picker */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Diagnosed Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="border border-gray-300 rounded-xl p-4 flex-row justify-between items-center"
                  >
                    <Text className={formData.diagnosedDate ? "text-gray-800" : "text-gray-400"}>
                      {formData.diagnosedDate 
                        ? new Date(formData.diagnosedDate).toLocaleDateString()
                        : "Select diagnosed date"
                      }
                    </Text>
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.diagnosedDate ? new Date(formData.diagnosedDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setFormData({
                            ...formData, 
                            diagnosedDate: selectedDate.toISOString().split('T')[0]
                          });
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">Status</Text>
                  <View className="flex-row space-x-2 gap-x-2">
                    {['active', 'resolved', 'chronic'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setFormData({...formData, status})}
                        className={`flex-1 p-3 rounded-xl ${
                          formData.status === status ? 'bg-blue-600' : 'bg-gray-100'
                        }`}
                      >
                        <Text className={`text-center font-medium ${
                          formData.status === status ? 'text-white' : 'text-gray-600'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TextInput
                  placeholder="Notes (optional)"
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  textAlignVertical="top"
                />
              </View>
            )}
            
            {modalType === 'medication' && (
              <TextInput
                placeholder="Medication name"
                value={formData.medication || ''}
                onChangeText={(text) => setFormData({...formData, medication: text})}
                className="border border-gray-300 rounded-xl p-4"
                returnKeyType="done"
              />
            )}

            {modalType === 'vitals' && (
              <View className="space-y-4 gap-y-4">
                <Text className="text-gray-700 font-medium">Blood Pressure</Text>
                <View className="flex-row space-x-2">
                  <TextInput
                    placeholder="Systolic"
                    value={formData.systolic?.toString() || undefined}
                    onChangeText={(text) => setFormData({
                      ...formData, 
                      bloodPressure: {
                        ...formData.bloodPressure,
                        systolic: parseInt(text) || 0
                      }
                    })}
                    className="flex-1 border border-gray-300 rounded-xl p-4 mr-1"
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                  <TextInput
                    placeholder="Diastolic"
                    value={formData.diastolic?.toString() || undefined}
                    onChangeText={(text) => setFormData({
                      ...formData, 
                      bloodPressure: {
                        ...formData.bloodPressure,
                        diastolic: parseInt(text) || 0
                      }
                    })}
                    className="flex-1 border border-gray-300 rounded-xl p-4 ml-1"
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
                <TextInput
                  placeholder="Heart Rate (bpm)"
                  value={formData.heartRate?.toString() || ''}
                  onChangeText={(text) => setFormData({...formData, heartRate: parseInt(text) || undefined})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Temperature (°C)"
                  value={formData.temperature?.toString() || ''}
                  onChangeText={(text) => setFormData({...formData, temperature: parseFloat(text) || undefined})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Weight (kg)"
                  value={formData.weight?.toString() || ''}
                  onChangeText={(text) => setFormData({...formData, weight: parseFloat(text) || undefined})}
                  className="border border-gray-300 rounded-xl p-4 placeholder:text-gray-400"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            )}

            {modalType === 'surgery' && (
              <View className="space-y-4">
                <TextInput
                  placeholder="Surgery Name"
                  value={formData.surgery || ''}
                  onChangeText={(text) => setFormData({...formData, surgery: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={formData.date || ''}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Hospital (optional)"
                  value={formData.hospital || ''}
                  onChangeText={(text) => setFormData({...formData, hospital: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Notes (optional)"
                  value={formData.notes || ''}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  textAlignVertical="top"
                />
              </View>
            )}

            {modalType === 'immunization' && (
              <View className="space-y-4">
                <TextInput
                  placeholder="Vaccine Name"
                  value={formData.vaccine || ''}
                  onChangeText={(text) => setFormData({...formData, vaccine: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={formData.date || ''}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Next Due Date (YYYY-MM-DD) - Optional"
                  value={formData.nextDue || ''}
                  onChangeText={(text) => setFormData({...formData, nextDue: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="done"
                />
              </View>
            )}

            {modalType === 'familyHistory' && (
              <View className="space-y-4">
                <TextInput
                  placeholder="Relation (e.g., Father, Mother)"
                  value={formData.relation || ''}
                  onChangeText={(text) => setFormData({...formData, relation: text})}
                  className="border border-gray-300 rounded-xl p-4"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Conditions (comma separated)"
                  value={formData.conditionsText || ''}
                  onChangeText={(text) => {
                    const conditions = text.split(',').map(c => c.trim()).filter(c => c);
                    setFormData({...formData, conditionsText: text, conditions});
                  }}
                  className="border border-gray-300 rounded-xl p-4"
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Add some extra padding at the bottom */}
            <View className="h-4" />
          </ScrollView>
          
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-600 rounded-xl p-4"
          >
            <Text className="text-white font-semibold text-center">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading medical history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Tabs */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 py-4"
          contentContainerStyle={{ flexGrow: 0 }}
        >
          <TabButton id="overview" title="Overview" icon="home" />
          <TabButton id="allergies" title="Allergies" icon="warning" />
          <TabButton id="conditions" title="Conditions" icon="medical" />
          <TabButton id="medications" title="Medications" icon="medical" />
          <TabButton id="vitals" title="Vitals" icon="pulse" />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'allergies' && renderAllergies()}
        {activeTab === 'conditions' && renderConditions()}
        {activeTab === 'medications' && renderMedications()}
        {activeTab === 'vitals' && renderVitals()}
        
        <View className="h-6" />
      </ScrollView>

      {renderAddModal()}
    </SafeAreaView>
  );
}