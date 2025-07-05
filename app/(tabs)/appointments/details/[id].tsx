// app/(tabs)/appointments/details/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { appointmentAPI } from '../../../../services/appointmentAPI';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { Appointment } from '@/hooks/useAppointments';

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'time-outline',
    bgColor: '#FEF3C7',
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'checkmark-circle-outline',
    bgColor: '#DBEAFE',
  },
  in_progress: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: 'play-circle-outline',
    bgColor: '#D1FAE5',
  },
  completed: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: 'checkmark-done-outline',
    bgColor: '#F3F4F6',
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: 'close-circle-outline',
    bgColor: '#FEE2E2',
  },
  no_show: {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: 'alert-circle-outline',
    bgColor: '#FED7AA',
  },
};

const typeConfig = {
  in_person: {
    icon: 'location-outline',
    name: 'In-Person Visit',
    color: '#2563EB',
  },
  video_call: {
    icon: 'videocam-outline',
    name: 'Video Call',
    color: '#10B981',
  },
  phone_call: {
    icon: 'call-outline',
    name: 'Phone Call',
    color: '#F59E0B',
  },
};

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    if (!isAuthenticated || !id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await appointmentAPI.getAppointment(id as string);
      setAppointment(response.appointment);
    } catch (error: any) {
      console.error('Fetch appointment details error:', error);
      setError(error.message);
      Alert.alert('Error', error.message || 'Failed to fetch appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            
            setUpdating(true);
            try {
              await appointmentAPI.cancelAppointment(id as string, 'Cancelled by patient');
              Alert.alert('Success', 'Appointment cancelled successfully');
              router.back();
            } catch (error: any) {
              console.error('Cancel appointment error:', error);
              Alert.alert('Error', error.message || 'Failed to cancel appointment');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCallDoctor = () => {
    if (appointment?.doctorPersionalInfo?.phone) {
      Linking.openURL(`tel:${appointment.doctorPersionalInfo.phone}`);
    }
  };

  const handleEmailDoctor = () => {
    if (appointment?.doctorPersionalInfo.email) {
      Linking.openURL(`mailto:${appointment.doctorPersionalInfo.email}`);
    }
  };

  const handleShareAppointment = async () => {
    if (!appointment) return;
    
    try {
      const shareMessage = `
Appointment Details:
Doctor: ${appointment.doctorPersionalInfo?.firstName} ${appointment.doctorPersionalInfo?.lastName}
Date: ${formatDate(appointment.appointmentDate)}
Time: ${formatTime(appointment.appointmentDate)}
Type: ${typeConfig[appointment.type].name}
Reason: ${appointment.reason}
      `.trim();

      await Share.share({
        message: shareMessage,
        title: 'Appointment Details',
      });
    } catch (error) {
      console.error('Error sharing appointment:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilAppointment = () => {
    if (!appointment) return '';
    
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const diffInMs = appointmentTime.getTime() - now.getTime();
    
    if (diffInMs < 0) return 'Past appointment';
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `In ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `In ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `In ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-2">Loading appointment details...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          Please log in to view appointment details
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchAppointmentDetails}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4">
          Appointment not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const config = statusConfig[appointment.status];
  const typeInfo = typeConfig[appointment.type];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View className="bg-gradient-to-br from-blue-600 to-green-500 px-4 pt-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                {appointment.doctorPersionalInfo?.firstName} {appointment.doctorPersionalInfo?.lastName}
              </Text>
              {appointment.doctorProfessionalInfo.specialization?.name && (
                <Text className="text-blue-100 mt-1">
                  {appointment.doctorProfessionalInfo.specialization?.name}
                </Text>
              )}
            </View>
            <View className="items-end">
              <View
                className={`px-3 py-1 rounded-full border ${config.color}`}
                style={{ backgroundColor: config.bgColor }}
              >
                <Text className={`text-xs font-medium capitalize ${config.color.split(' ')[1]}`}>
                  {appointment.status.replace('_', ' ')}
                </Text>
              </View>
              <Text className="text-blue-100 text-sm mt-1">
                {getTimeUntilAppointment()}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment Info */}
        <View className="px-4 -mt-4">
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons
                name={typeInfo.icon as any}
                size={24}
                color={typeInfo.color}
              />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                {typeInfo.name}
              </Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <View className="ml-3">
                  <Text className="text-gray-600 text-sm">Date</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatDate(appointment.appointmentDate)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <View className="ml-3">
                  <Text className="text-gray-600 text-sm">Time</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatTime(appointment.appointmentDate)} ({appointment.duration} minutes)
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-600 text-sm">Reason</Text>
                  <Text className="text-gray-900 font-medium">
                    {appointment.reason}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View className="px-4 mt-4">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Notes
                </Text>
              </View>
              <Text className="text-gray-700 leading-6">
                {appointment.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Contact Doctor */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Contact Doctor
            </Text>
            <View className="flex-row space-x-3">
              {appointment.doctorPersionalInfo.phone && (
                <TouchableOpacity
                  onPress={handleCallDoctor}
                  className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 items-center"
                >
                  <Ionicons name="call-outline" size={20} color="#10B981" />
                  <Text className="text-green-700 font-medium mt-1">Call</Text>
                </TouchableOpacity>
              )}
              {appointment.doctorPersionalInfo.email && (
                <TouchableOpacity
                  onPress={handleEmailDoctor}
                  className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 items-center"
                >
                  <Ionicons name="mail-outline" size={20} color="#2563EB" />
                  <Text className="text-blue-700 font-medium mt-1">Email</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Prescription */}
        {appointment.prescription && (
          <View className="px-4 mt-4">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="medical-outline" size={20} color="#6B7280" />
                  <Text className="text-lg font-semibold text-gray-900 ml-2">
                    Prescription
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/prescriptions/details/[id]',
                    params: { id: appointment.prescription?._id as string }
                  })}
                  className="bg-blue-50 px-3 py-1 rounded-lg"
                >
                  <Text className="text-blue-600 font-medium">View Details</Text>
                </TouchableOpacity>
              </View>
              <View className="space-y-2">
                {appointment.prescription.medications.map((med, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                    <Text className="text-gray-900 flex-1">
                      {med.name} - {med.dosage}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleShareAppointment}
            className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-2">Share</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity
              onPress={handleCancelAppointment}
              disabled={updating}
              className="flex-1 bg-red-50 border border-red-200 px-4 py-3 rounded-lg items-center justify-center"
            >
              {updating ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                  <Text className="text-red-600 font-medium ml-2">Cancel Appointment</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {appointment.status === 'confirmed' && (
            <TouchableOpacity
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 px-4 py-3 rounded-lg items-center justify-center"
            >
              <Text className="text-white font-semibold">Join Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}