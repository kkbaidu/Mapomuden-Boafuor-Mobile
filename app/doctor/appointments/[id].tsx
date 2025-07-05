import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDoctorAppointments, Appointment } from '../../../hooks/useDoctorAppointments';
import { useAuthContext } from '../../../contexts/AuthContext';

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

export default function DoctorAppointmentDetails() {
    const { id } = useLocalSearchParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated } = useAuthContext();
    const { getAppointmentById, updateAppointmentStatus } = useDoctorAppointments();

    useEffect(() => {
        fetchAppointmentDetails();
    }, [id]);

    const fetchAppointmentDetails = async () => {
        if (!id) return;

        try {
            setError(null);
            setLoading(true);
            const result = await getAppointmentById(id as string);
            
            if (result.success) {
                setAppointment(result.data);
            } else {
                setError(result.error || 'Failed to fetch appointment details');
            }
        } catch (error: any) {
            console.error('Fetch appointment details error:', error);
            setError(error.message || 'Failed to fetch appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: Appointment['status'], notes?: string) => {
        if (!appointment) return;

        Alert.alert(
            'Update Status',
            `Are you sure you want to mark this appointment as ${status.replace('_', ' ')}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            const result = await updateAppointmentStatus(appointment._id, status, notes);
                            
                            if (result.success) {
                                setAppointment(prev => prev ? { ...prev, status, notes: notes || prev.notes } : null);
                                Alert.alert('Success', `Appointment ${status.replace('_', ' ')} successfully`);
                            } else {
                                Alert.alert('Error', result.error || 'Failed to update appointment');
                            }
                        } catch (error: any) {
                            console.error('Update status error:', error);
                            Alert.alert('Error', error.message || 'Failed to update appointment');
                        } finally {
                            setUpdating(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCallPatient = () => {
        if (appointment?.patient.phone) {
            Linking.openURL(`tel:${appointment.patient.phone}`);
        } else {
            Alert.alert('Error', 'Patient phone number not available');
        }
    };

    const handleEmailPatient = () => {
        if (appointment?.patient.email) {
            Linking.openURL(`mailto:${appointment.patient.email}`);
        } else {
            Alert.alert('Error', 'Patient email not available');
        }
    };

    const handleShareAppointment = async () => {
        if (!appointment) return;

        try {
            const shareMessage = `
Appointment Details:
Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}
Date: ${formatDate(appointment.appointmentDate)}
Time: ${formatTime(appointment.appointmentDate)}
Type: ${typeConfig[appointment.type].name}
Status: ${appointment.status.replace('_', ' ').toUpperCase()}
Reason: ${appointment.reason}
            `.trim();

            await Share.share({
                message: shareMessage,
            });
        } catch (error) {
            console.error('Share error:', error);
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

    if (!isAuthenticated || user?.role !== 'doctor') {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
                <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
                    Doctor access required
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/login')}
                    className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                >
                    <Text className="text-white font-semibold">Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-600 mt-2">Loading appointment details...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
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
            </SafeAreaView>
        );
    }

    if (!appointment) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-4">
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
            </SafeAreaView>
        );
    }

    const config = statusConfig[appointment.status];
    const typeInfo = typeConfig[appointment.type];
    const timeUntil = getTimeUntilAppointment();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4">
                <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">Appointment Details</Text>
                    <TouchableOpacity onPress={handleShareAppointment}>
                        <Ionicons name="share-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Status Banner */}
                <View 
                    className="mx-4 mt-4 p-4 rounded-xl flex-row items-center justify-between"
                    style={{ backgroundColor: config.bgColor }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name={config.icon as any} size={24} color={statusConfig[appointment.status].color.split(' ')[1] === 'text-yellow-800' ? '#D97706' : '#374151'} />
                        <Text className="ml-3 text-lg font-semibold text-gray-900 capitalize">
                            {appointment.status.replace('_', ' ')}
                        </Text>
                    </View>
                    {timeUntil && (
                        <Text className="text-sm font-medium text-gray-700">{timeUntil}</Text>
                    )}
                </View>

                {/* Patient Information */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Patient Information</Text>
                    
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center">
                            <Text className="text-white font-bold text-lg">
                                {appointment.patient.firstName.charAt(0)}
                            </Text>
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-lg font-semibold text-gray-900">
                                {appointment.patient.firstName} {appointment.patient.lastName}
                            </Text>
                            <Text className="text-gray-600">Patient</Text>
                        </View>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <Ionicons name="call-outline" size={20} color="#6B7280" />
                            <Text className="ml-3 text-gray-900">{appointment.patient.phone}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="mail-outline" size={20} color="#6B7280" />
                            <Text className="ml-3 text-gray-900">{appointment.patient.email}</Text>
                        </View>
                    </View>

                    <View className="flex-row mt-4 space-x-3">
                        <TouchableOpacity
                            onPress={handleCallPatient}
                            className="flex-1 bg-green-600 px-4 py-3 rounded-lg flex-row items-center justify-center"
                        >
                            <Ionicons name="call" size={18} color="white" />
                            <Text className="text-white font-semibold ml-2">Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleEmailPatient}
                            className="flex-1 bg-blue-600 px-4 py-3 rounded-lg flex-row items-center justify-center"
                        >
                            <Ionicons name="mail" size={18} color="white" />
                            <Text className="text-white font-semibold ml-2">Email</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Appointment Details */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</Text>
                    
                    <View className="space-y-4">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <View className="ml-3">
                                <Text className="text-gray-600 text-sm">Date</Text>
                                <Text className="text-gray-900 font-medium">{formatDate(appointment.appointmentDate)}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                            <View className="ml-3">
                                <Text className="text-gray-600 text-sm">Time</Text>
                                <Text className="text-gray-900 font-medium">{formatTime(appointment.appointmentDate)}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                            <View className="ml-3">
                                <Text className="text-gray-600 text-sm">Type</Text>
                                <Text className="text-gray-900 font-medium">{typeInfo.name}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                            <View className="ml-3">
                                <Text className="text-gray-600 text-sm">Duration</Text>
                                <Text className="text-gray-900 font-medium">{appointment.duration} minutes</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reason for Visit */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm border border-gray-100">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Reason for Visit</Text>
                    <Text className="text-gray-700 leading-6">{appointment.reason}</Text>
                </View>

                {/* Notes */}
                {appointment.notes && (
                    <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">Notes</Text>
                        <Text className="text-gray-700 leading-6">{appointment.notes}</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="mx-4 mt-6 mb-8">
                    {appointment.status === 'pending' && (
                        <View className="space-y-3">
                            <TouchableOpacity
                                onPress={() => handleStatusUpdate('confirmed')}
                                disabled={updating}
                                className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center"
                            >
                                {updating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="white" />
                                        <Text className="text-white font-semibold text-lg ml-2">Confirm Appointment</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleStatusUpdate('cancelled', 'Cancelled by doctor')}
                                disabled={updating}
                                className="bg-red-600 py-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Ionicons name="close-circle" size={20} color="white" />
                                <Text className="text-white font-semibold text-lg ml-2">Cancel Appointment</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {appointment.status === 'confirmed' && (
                        <View className="space-y-3">
                            <TouchableOpacity
                                onPress={() => handleStatusUpdate('in_progress')}
                                disabled={updating}
                                className="bg-green-600 py-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Ionicons name="play-circle" size={20} color="white" />
                                <Text className="text-white font-semibold text-lg ml-2">Start Consultation</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleStatusUpdate('no_show', 'Patient did not show up')}
                                disabled={updating}
                                className="bg-orange-600 py-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Ionicons name="alert-circle" size={20} color="white" />
                                <Text className="text-white font-semibold text-lg ml-2">Mark as No Show</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {appointment.status === 'in_progress' && (
                        <TouchableOpacity
                            onPress={() => handleStatusUpdate('completed')}
                            disabled={updating}
                            className="bg-gray-800 py-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="checkmark-done" size={20} color="white" />
                            <Text className="text-white font-semibold text-lg ml-2">Complete Consultation</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}