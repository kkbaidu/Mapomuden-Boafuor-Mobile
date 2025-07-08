import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { prescriptionAPI, Prescription } from '../../../../services/prescriptionAPI';

const PrescriptionDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrescription = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      const response = await prescriptionAPI.getPrescription(id);
      if (response && response.prescription) {
        setPrescription(response.prescription);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch prescription details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#6B7280';
      case 'expired': return '#EF4444';
      case 'cancelled': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'completed': return 'checkmark-done-circle';
      case 'expired': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCallPharmacy = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading prescription details...</Text>
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Prescription Not Found</Text>
        <Text style={styles.errorMessage}>
          The prescription you're looking for could not be found.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(prescription.status)}
              size={24}
              color="#ffffff"
            />
            <Text style={styles.statusText}>
              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.prescriptionDate}>
            Prescribed on {formatDate(prescription.prescriptionDate)}
          </Text>
        </View>
      </LinearGradient>

      {/* Doctor Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="local-hospital" size={24} color="#10B981" />
          <Text style={styles.cardTitle}>Prescribed By</Text>
        </View>
        <Text style={styles.doctorName}>
          Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
        </Text>
      </View>

      {/* Diagnosis */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="medical-services" size={24} color="#10B981" />
          <Text style={styles.cardTitle}>Diagnosis</Text>
        </View>
        <Text style={styles.diagnosisText}>{prescription.diagnosis}</Text>
      </View>

      {/* Medications */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medical" size={24} color="#10B981" />
          <Text style={styles.cardTitle}>Medications</Text>
        </View>
        {prescription.medications.map((medication, index) => (
          <View key={index} style={styles.medicationItem}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDosage}>{medication.dosage}</Text>
            </View>
            <View style={styles.medicationDetails}>
              <View style={styles.medicationDetailRow}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.medicationDetailText}>
                  {medication.frequency} for {medication.duration}
                </Text>
              </View>
              <View style={styles.medicationDetailRow}>
                <Ionicons name="basket-outline" size={16} color="#6B7280" />
                <Text style={styles.medicationDetailText}>
                  Quantity: {medication.quantity}
                </Text>
              </View>
              {medication.instructions && (
                <View style={styles.instructionsContainer}>
                  <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                  <Text style={styles.instructionsText}>{medication.instructions}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Notes */}
      {prescription.notes && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Additional Notes</Text>
          </View>
          <Text style={styles.notesText}>{prescription.notes}</Text>
        </View>
      )}

      {/* Prescription Dates */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={24} color="#10B981" />
          <Text style={styles.cardTitle}>Important Dates</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Prescribed:</Text>
          <Text style={styles.dateValue}>
            {formatDate(prescription.prescriptionDate)}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Expires:</Text>
          <Text style={[
            styles.dateValue,
            { color: new Date(prescription.expiryDate) < new Date() ? '#EF4444' : '#374151' }
          ]}>
            {formatDate(prescription.expiryDate)}
          </Text>
        </View>
        {prescription.filled && prescription.filledDate && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Filled:</Text>
            <Text style={styles.dateValue}>
              {formatDate(prescription.filledDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Pharmacy Information */}
      {prescription.pharmacy && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-pharmacy" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Pharmacy</Text>
          </View>
          <Text style={styles.pharmacyName}>{prescription.pharmacy.name}</Text>
          <Text style={styles.pharmacyAddress}>{prescription.pharmacy.address}</Text>
          
          <View style={styles.pharmacyActions}>
            <TouchableOpacity
              style={styles.pharmacyButton}
              onPress={() => handleCallPharmacy(prescription.pharmacy!.phone)}
            >
              <Ionicons name="call" size={20} color="#10B981" />
              <Text style={styles.pharmacyButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pharmacyButton}
              onPress={() => handleGetDirections(prescription.pharmacy!.address)}
            >
              <Ionicons name="navigate" size={20} color="#10B981" />
              <Text style={styles.pharmacyButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  prescriptionDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  diagnosisText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  medicationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  medicationDetails: {
    gap: 8,
  },
  medicationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medicationDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pharmacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    flex: 1,
    justifyContent: 'center',
  },
  pharmacyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  bottomPadding: {
    height: 100,
  },
});

export default PrescriptionDetails;