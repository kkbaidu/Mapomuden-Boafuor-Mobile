// app/(tabs)/appointments/book.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { doctorAPI } from '../../../services/doctorAPI';
import { appointmentAPI, CreateAppointmentData } from '../../../services/appointmentAPI';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Doctor {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  specializations: Array<{
    name: string;
    yearsOfExperience: number;
  }>;
  rating: {
    average: number;
    totalReviews: number;
  };
  consultationFees: {
    inPerson: number;
    videoCall: number;
    phoneCall: number;
    currency: string;
  };
  hospital?: string;
  clinic?: string;
}

const appointmentTypes = [
  {
    id: 'in_person',
    name: 'In-Person',
    icon: 'location-outline',
    description: 'Visit the clinic',
    color: 'bg-blue-50 border-blue-200',
    iconColor: '#2563EB',
  },
  {
    id: 'video_call',
    name: 'Video Call',
    icon: 'videocam-outline',
    description: 'Online consultation',
    color: 'bg-purple-50 border-purple-200',
    iconColor: '#7C3AED',
  },
  {
    id: 'phone_call',
    name: 'Phone Call',
    icon: 'call-outline',
    description: 'Audio consultation',
    color: 'bg-green-50 border-green-200',
    iconColor: '#10B981',
  },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export default function BookAppointmentScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { isAuthenticated } = useAuthContext();
  
  // Form data
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedType, setSelectedType] = useState('in_person');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setFetchingDoctors(true);
      const response = await doctorAPI.getAllDoctors();
      setDoctors(response || []);
    } catch (error: any) {
      console.error('Fetch doctors error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch doctors');
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedTime || !reason.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in to book an appointment');
      return;
    }

    setLoading(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData: CreateAppointmentData = {
        doctorId: selectedDoctor._id,
        doctorUserId: selectedDoctor.user._id,
        appointmentDate: appointmentDateTime,
        type: selectedType as 'in_person' | 'video_call' | 'phone_call',
        reason: reason.trim(),
        duration: 30,
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      
      Alert.alert(
        'Success',
        response.message || 'Appointment booked successfully! You will receive a confirmation shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Book appointment error:', error);
      Alert.alert('Error', error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center px-4 py-6 bg-white border-b border-gray-100">
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step >= stepNumber
                ? 'bg-blue-600'
                : 'bg-gray-200'
            }`}
          >
            <Text
              className={`font-semibold ${
                step >= stepNumber ? 'text-white' : 'text-gray-500'
              }`}
            >
              {stepNumber}
            </Text>
          </View>
          {stepNumber < 3 && (
            <View
              className={`w-12 h-0.5 mx-2 ${
                step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderDoctorSelection = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Select a Doctor
      </Text>
      <Text className="text-gray-600 mb-6">
        Choose from our available healthcare providers
      </Text>

      <View className="space-y-3">
        {fetchingDoctors ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-600 mt-2">Loading doctors...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No doctors available
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Please try again later
            </Text>
          </View>
        ) : (
          doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor._id}
              onPress={() => setSelectedDoctor(doctor)}
              className={`p-4 rounded-xl border-2 ${
                selectedDoctor?._id === doctor._id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-row items-center space-x-3">
                <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {doctor.user.firstName.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">
                    {doctor.user.firstName} {doctor.user.lastName}
                  </Text>
                  <Text className="text-gray-600">
                    {doctor.specializations[0]?.name || 'General Practitioner'}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-gray-600 ml-1">
                      {doctor.rating.average.toFixed(1)} ({doctor.rating.totalReviews} reviews)
                    </Text>
                  </View>
                  {doctor.hospital && (
                    <Text className="text-gray-500 text-sm mt-1">
                      {doctor.hospital}
                    </Text>
                  )}
                </View>
                {selectedDoctor?._id === doctor._id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderTypeAndDateTime = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Appointment Details
      </Text>
      <Text className="text-gray-600 mb-6">
        Choose type, date, and time for your appointment
      </Text>

      {/* Appointment Type */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Appointment Type
      </Text>
      <View className="flex-row space-x-3 mb-6">
        {appointmentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setSelectedType(type.id)}
            className={`flex-1 p-4 rounded-xl border-2 ${
              selectedType === type.id
                ? 'border-blue-600 bg-blue-50'
                : `border-gray-200 ${type.color}`
            }`}
          >
            <View className="items-center">
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.id ? '#2563EB' : type.iconColor}
              />
              <Text className="font-medium text-gray-900 mt-2">
                {type.name}
              </Text>
              <Text className="text-xs text-gray-600 text-center mt-1">
                {type.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Selection */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Select Date
      </Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="bg-white border border-gray-300 rounded-lg p-4 mb-6"
      >
        <View className="flex-row items-center space-x-3">
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text className="text-gray-900 text-lg">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Time Selection */}
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Available Times
      </Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            onPress={() => setSelectedTime(time)}
            className={`px-4 py-3 rounded-lg border ${
              selectedTime === time
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 bg-white'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedTime === time ? 'text-white' : 'text-gray-700'
              }`}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderReasonAndConfirm = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Appointment Reason
      </Text>
      <Text className="text-gray-600 mb-6">
        Briefly describe the reason for your visit
      </Text>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Reason for Visit *
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="e.g., Regular checkup, Follow-up consultation..."
          multiline
          numberOfLines={4}
          className="bg-white border border-gray-300 rounded-lg p-4 text-gray-900"
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      {/* Summary */}
      <View className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Appointment Summary
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Doctor:</Text>
            <Text className="font-medium text-gray-900">
              {selectedDoctor?.user.firstName} {selectedDoctor?.user.lastName}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Type:</Text>
            <Text className="font-medium text-gray-900 capitalize">
              {selectedType.replace('_', ' ')}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Date:</Text>
            <Text className="font-medium text-gray-900">
              {selectedDate.toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Time:</Text>
            <Text className="font-medium text-gray-900">
              {selectedTime}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {renderStepIndicator()}
      
      {step === 1 && renderDoctorSelection()}
      {step === 2 && renderTypeAndDateTime()}
      {step === 3 && renderReasonAndConfirm()}

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row space-x-3">
          {step > 1 && (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
            >
              <Text className="text-gray-700 font-semibold">Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={() => {
              if (step === 3) {
                handleBookAppointment();
              } else if (step === 1 && selectedDoctor) {
                setStep(2);
              } else if (step === 2 && selectedTime) {
                setStep(3);
              } else {
                Alert.alert('Error', 'Please complete the current step');
              }
            }}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg items-center ${
              loading
                ? 'bg-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-green-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-gray-700 font-semibold">
                {step === 3 ? 'Book Appointment' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}