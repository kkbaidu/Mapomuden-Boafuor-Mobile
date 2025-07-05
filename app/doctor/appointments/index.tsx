import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDoctorAppointments } from '../../../hooks/useDoctorAppointments';
import { useAuthContext } from '../../../contexts/AuthContext';

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: '#F59E0B' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: '#3B82F6' },
  in_progress: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: '#10B981' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '#6B7280' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '#EF4444' },
  no_show: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: '#F97316' },
};

const typeIcons = {
  in_person: 'location-outline',
  video_call: 'videocam-outline',
  phone_call: 'call-outline',
};

export default function DoctorAppointments() {
    const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'confirmed'>('all');
    const [refreshing, setRefreshing] = useState(false);
    const { user, isAuthenticated } = useAuthContext();
    const {
        appointments,
        stats,
        loading,
        error,
        refreshAppointments,
        filterAppointmentsByStatus,
        getTodayAppointments,
        getUpcomingAppointments,
    } = useDoctorAppointments();

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshAppointments();
        setRefreshing(false);
    };

    console.log('Doctor Appointments:', appointments);

    const getFilteredAppointments = () => {
        switch (filter) {
            case 'today':
                return getTodayAppointments();
            case 'pending':
                return filterAppointmentsByStatus('pending');
            case 'confirmed':
                return filterAppointmentsByStatus('confirmed');
            default:
                return appointments;
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (d.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isAuthenticated || user?.role !== 'doctor') {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
                <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
                    Doctor access required
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                    Please log in with a doctor account
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
                <Text className="text-gray-600 mt-2">Loading appointments...</Text>
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
                    onPress={refreshAppointments}
                    className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const filteredAppointments = getFilteredAppointments();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">My Appointments</Text>
                        <Text className="text-gray-600 mt-1">
                            Welcome back, Dr. {user?.firstName}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        className="bg-blue-50 p-3 rounded-full"
                    >
                        <Ionicons name="refresh" size={20} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            {stats && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 py-4"
                >
                    <View className="flex-row space-x-4">
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[120px]">
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                                <Text className="text-gray-600 text-sm ml-2">Today</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</Text>
                        </View>
                        
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[120px]">
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                                <Text className="text-gray-600 text-sm ml-2">Pending</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</Text>
                        </View>
                        
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[120px]">
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                                <Text className="text-gray-600 text-sm ml-2">Confirmed</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</Text>
                        </View>
                        
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[120px]">
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-done-outline" size={20} color="#6B7280" />
                                <Text className="text-gray-600 text-sm ml-2">Completed</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</Text>
                        </View>
                    </View>
                </ScrollView>
            )}

            {/* Filter Tabs */}
            <View className="bg-white border-b border-gray-200 px-4 py-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-3">
                        {(['all', 'today', 'pending', 'confirmed'] as const).map((filterOption) => (
                            <TouchableOpacity
                                key={filterOption}
                                onPress={() => setFilter(filterOption)}
                                className={`px-4 py-2 rounded-full border ${
                                    filter === filterOption
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text
                                    className={`font-medium capitalize ${
                                        filter === filterOption ? 'text-white' : 'text-gray-700'
                                    }`}
                                >
                                    {filterOption}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Appointments List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {filteredAppointments.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 text-lg font-medium mt-4">
                            No appointments found
                        </Text>
                        <Text className="text-gray-400 text-center mt-2 px-8">
                            {filter === 'all'
                                ? "You don't have any appointments yet"
                                : `No ${filter} appointments`}
                        </Text>
                    </View>
                ) : (
                    <View className="py-4 space-y-4">
                        {filteredAppointments.map((appointment) => {
                            const statusConfig = statusColors[appointment.status];
                            return (
                                <TouchableOpacity
                                    key={appointment._id}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/doctor/appointments/[id]',
                                            params: { id: appointment._id },
                                        })
                                    }
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-900">
                                                {appointment.patient.firstName} {appointment.patient.lastName}
                                            </Text>
                                            <Text className="text-gray-600 mt-1">{appointment.reason}</Text>
                                        </View>
                                        <View className="flex-row items-center space-x-2">
                                            <Ionicons
                                                name={typeIcons[appointment.type] as any}
                                                size={16}
                                                color="#6B7280"
                                            />
                                            <View
                                                className={`px-2 py-1 rounded-md border ${statusConfig.bg} ${statusConfig.border}`}
                                            >
                                                <Text className={`text-xs font-medium capitalize ${statusConfig.text}`}>
                                                    {appointment.status.replace('_', ' ')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center space-x-4">
                                            <View className="flex-row items-center space-x-1">
                                                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                                <Text className="text-gray-600 text-sm">
                                                    {formatDate(appointment.appointmentDate)}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center space-x-1">
                                                <Ionicons name="time-outline" size={16} color="#6B7280" />
                                                <Text className="text-gray-600 text-sm">
                                                    {formatTime(appointment.appointmentDate)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center space-x-1">
                                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                                            <Text className="text-gray-500 text-sm">{appointment.duration}min</Text>
                                        </View>
                                    </View>

                                    {appointment.notes && (
                                        <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <Text className="text-gray-700 text-sm">{appointment.notes}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}