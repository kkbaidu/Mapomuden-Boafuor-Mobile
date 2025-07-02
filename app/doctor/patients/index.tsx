// app/doctor/patients/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { debounce } from 'lodash';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  location: string;
  gender: 'male' | 'female' | '';
  bloodGroup: string;
  lastVisit?: string;
  totalAppointments: number;
}

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export default function PatientsList() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${base_url}/doctor/patients`);
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPatients = useCallback(
    debounce(() => {
      if (!searchQuery.trim()) {
        setFilteredPatients(patients);
        return;
      }

      const filtered = patients.filter((patient) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          patient.firstName.toLowerCase().includes(searchTerm) ||
          patient.lastName.toLowerCase().includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm) ||
          patient.phone.includes(searchTerm) ||
          patient.location.toLowerCase().includes(searchTerm)
        );
      });

      setFilteredPatients(filtered);
    }, 300),
    [searchQuery, patients]
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return 'male';
      case 'female': return 'female';
      default: return 'person';
    }
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => router.push(`/doctor/patients/${item._id}` as any)}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientAvatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.firstName, item.lastName)}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <View style={styles.patientDetails}>
            <MaterialIcons 
              name={getGenderIcon(item.gender)} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.detailText}>{item.gender || 'Not specified'}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.detailText}>
              {item.bloodGroup || 'Unknown'}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <MaterialIcons name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
          {item.email && (
            <View style={styles.contactInfo}>
              <MaterialIcons name="email" size={14} color="#666" />
              <Text style={styles.contactText}>{item.email}</Text>
            </View>
          )}
        </View>
        <View style={styles.patientStats}>
          <Text style={styles.statsNumber}>{item.totalAppointments}</Text>
          <Text style={styles.statsLabel}>Appointments</Text>
          {item.lastVisit && (
            <Text style={styles.lastVisit}>
              Last: {new Date(item.lastVisit).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="people-outline" size={64} color="#BDBDBD" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No patients found' : 'No patients yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Patients will appear here once they book appointments with you'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Patients Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </Text>
      </View>

      {/* Patients List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  separator: {
    marginHorizontal: 8,
    color: '#999',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  patientStats: {
    alignItems: 'center',
    minWidth: 80,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lastVisit: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});