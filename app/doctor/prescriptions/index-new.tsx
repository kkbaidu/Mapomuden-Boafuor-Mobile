import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePrescriptions } from '../../../hooks/usePrescriptions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Prescription } from '../../../services/prescriptionAPI';

export default function PrescriptionsIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  
  const { prescriptions, loading, error, refreshPrescriptions } = usePrescriptions();
  const { user, isAuthenticated } = useAuthContext();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPrescriptions();
    setRefreshing(false);
  };

  const handleCreatePrescription = () => {
    // Navigate to patient selection screen
    router.push('/doctor/patients');
  };

  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        `${p.patient.firstName} ${p.patient.lastName}`.toLowerCase().includes(query) ||
        p.diagnosis.toLowerCase().includes(query) ||
        p.medications.some(med => med.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#10B981', text: '#FFFFFF' };
      case 'completed':
        return { bg: '#6B7280', text: '#FFFFFF' };
      case 'expired':
        return { bg: '#EF4444', text: '#FFFFFF' };
      case 'cancelled':
        return { bg: '#F59E0B', text: '#FFFFFF' };
      default:
        return { bg: '#6B7280', text: '#FFFFFF' };
    }
  };

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
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
      onPress={() => router.push(`/doctor/patients/${item.patient._id}`)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
              {getPatientInitials(item.patient.firstName, item.patient.lastName)}
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 }}>
              {item.patient.firstName} {item.patient.lastName}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {item.diagnosis}
            </Text>
          </View>
        </View>
        
        <View
          style={{
            backgroundColor: getStatusColor(item.status).bg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              color: getStatusColor(item.status).text,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'capitalize',
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
          Medications:
        </Text>
        {item.medications.slice(0, 2).map((med, index) => (
          <Text key={index} style={{ fontSize: 14, color: '#6B7280', marginLeft: 8 }}>
            • {med.name} - {med.dosage} ({med.frequency})
          </Text>
        ))}
        {item.medications.length > 2 && (
          <Text style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 8, fontStyle: 'italic' }}>
            +{item.medications.length - 2} more
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
          Prescribed: {formatDate(item.prescriptionDate)}
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
          Expires: {formatDate(item.expiryDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated || user?.role !== 'doctor') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666', fontSize: 18 }}>Unauthorized</Text>
      </SafeAreaView>
    );
  }

  if (loading && prescriptions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
          Loading prescriptions...
        </Text>
      </SafeAreaView>
    );
  }

  const filteredPrescriptions = getFilteredPrescriptions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              Prescriptions
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
              Manage patient prescriptions
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={onRefresh}
              style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}
            >
              <Ionicons name="refresh" size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreatePrescription}
              style={{ backgroundColor: '#2563EB', padding: 12, borderRadius: 8 }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' }}
            placeholder="Search prescriptions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'expired', label: 'Expired' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key as any)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: filter === tab.key ? '#2563EB' : '#F3F4F6',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: filter === tab.key ? '#fff' : '#6B7280',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prescriptions Count */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>
          {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'} found
        </Text>
      </View>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
          <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374791', marginTop: 16, marginBottom: 8 }}>
            {searchQuery || filter !== 'all' ? 'No prescriptions found' : 'No prescriptions yet'}
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first prescription for a patient'
            }
          </Text>
          {!searchQuery && filter === 'all' && (
            <TouchableOpacity
              onPress={handleCreatePrescription}
              style={{
                backgroundColor: '#2563EB',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                Create Prescription
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPrescriptions}
          renderItem={renderPrescriptionItem}
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
