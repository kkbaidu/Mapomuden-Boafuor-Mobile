// app/(tabs)/appointments/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  appointmentAPI,
  AppointmentFilters,
} from "../../../services/appointmentAPI";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useAppointments } from "../../../hooks/useAppointments";

const base_url =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// Types
interface Appointment {
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
  };
  appointmentDate: string;
  duration: number;
  type: "in_person" | "video_call" | "phone_call";
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  reason: string;
  notes?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  in_progress: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  no_show: "bg-orange-100 text-orange-800 border-orange-300",
};

const typeIcons = {
  in_person: "location-outline",
  video_call: "videocam-outline",
  phone_call: "call-outline",
};

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const {
    appointments,
    loading,
    error,
    refreshAppointments,
    filterAppointments,
  } = useAppointments();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAppointments();
    setRefreshing(false);
  };

  const filteredAppointments = filterAppointments(filter);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-2">Loading appointments...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
          Please log in to view appointments
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
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
          onPress={refreshAppointments}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with filters */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex flex-row justify-between">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {(["all", "upcoming", "past"] as const).map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                onPress={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-full border ${
                  filter === filterOption
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`font-medium capitalize ${
                    filter === filterOption ? "text-white" : "text-gray-700"
                  }`}
                >
                  {filterOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={() => router.push("/appointments/book")}
          className="bg-blue-600 px-3 flex justify-center rounded-lg"
        >
          <Text className="text-white font-semibold">Book Appointment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 pb-32">
            <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No appointments found
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              {filter === "all"
                ? "You don't have any appointments yet"
                : `No ${filter} appointments`}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/appointments/book")}
              className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
            >
              <Text className="text-white font-semibold">Book Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="py-4 space-y-4 pb-24">
            {filteredAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment._id}
                onPress={() =>
                  router.push({
                    pathname: "/appointments/details/[id]",
                    params: { id: appointment._id },
                  })
                }
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {appointment.doctorPersionalInfo?.firstName}{" "}
                      {appointment.doctorPersionalInfo?.lastName}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {appointment.reason}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <Ionicons
                      name={typeIcons[appointment.type] as any}
                      size={16}
                      color="#6B7280"
                    />
                    <View
                      className={`px-2 py-1 rounded-md border ${
                        statusColors[appointment.status]
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium capitalize ${
                          statusColors[appointment.status].split(" ")[1]
                        }`}
                      >
                        {appointment.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-4">
                    <View className="flex-row items-center space-x-1">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#6B7280"
                      />
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
                    <Text className="text-gray-500 text-sm">
                      {appointment.duration}min
                    </Text>
                  </View>
                </View>

                {appointment.notes && (
                  <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-gray-700 text-sm">
                      {appointment.notes}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/appointments/book")}
        className="absolute bottom-20 right-6 bg-gradient-to-r from-blue-600 to-green-500 w-14 h-14 rounded-full shadow-lg items-center justify-center"
        style={{
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
