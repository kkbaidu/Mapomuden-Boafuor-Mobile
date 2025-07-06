import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePatients } from '../../../hooks/usePatients';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Patient } from '../../../services/patientAPI';

export default function PatientsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { patients, loading, error, total, searchPatients, refreshPatients } = usePatients();
  const { user, isAuthenticated } = useAuthContext();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchPatients(query.trim());
    } else {
      await refreshPatients();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPatients();
    setRefreshing(false);
  };

  const handlePatientPress = (patient: Patient) => {
    router.push(`/doctor/patients/${patient._id}`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastVisit = (lastVisit: string | null) => {
    if (!lastVisit) return 'No visits yet';
    const date = new Date(lastVisit);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => handlePatientPress(item)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#2563EB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            {getInitials(item.firstName, item.lastName)}
          </Text>
        </View>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
            {item.firstName} {item.lastName}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={{ fontSize: 14, color: '#666', marginLeft: 4, textTransform: 'capitalize' }}>
              {item.gender || 'Not specified'}
            </Text>
            <Text style={{ marginHorizontal: 8, color: '#999' }}>•</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {item.bloodGroup || 'Unknown'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={{ fontSize: 14, color: '#666', marginLeft: 6 }}>
              {item.phone}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="mail-outline" size={14} color="#666" />
            <Text style={{ fontSize: 14, color: '#666', marginLeft: 6 }}>
              {item.email}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={{ fontSize: 14, color: '#666', marginLeft: 6 }}>
              {item.location}
            </Text>
          </View>
        </View>
        
        <View style={{ alignItems: 'center', minWidth: 80 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563EB' }}>
            {item.appointmentCount || 0}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Appointments
          </Text>
          <Text style={{ fontSize: 10, color: '#999', marginTop: 4, textAlign: 'center' }}>
            {formatLastVisit(item.lastVisit || null)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated || user?.role !== 'doctor') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
        <Text style={{ color: '#666', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
          Doctor access required
        </Text>
        <Text style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
          Please log in with a doctor account
        </Text>
      </SafeAreaView>
    );
  }

  if (loading && patients.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
          Loading patients...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              My Patients
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
              Manage your patient records
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}
          >
            <Ionicons name="refresh" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' }}
            placeholder="Search patients..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Patient Count */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>
          {total} {total === 1 ? 'patient' : 'patients'} found
        </Text>
      </View>

      {/* Patients List */}
      {patients.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374791', marginTop: 16, marginBottom: 8 }}>
            {searchQuery ? 'No patients found' : 'No patients yet'}
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Patients will appear here once they book appointments with you'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
