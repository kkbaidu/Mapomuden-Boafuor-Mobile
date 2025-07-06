import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePrescriptions } from '../../../../hooks/usePrescriptions';
import { usePatients } from '../../../../hooks/usePatients';
import { Medication } from '../../../../services/prescriptionAPI';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function CreatePrescription() {
    const { patientId } = useLocalSearchParams();
    const router = useRouter();
    const { createPrescription } = usePrescriptions();
    const { getPatientDetails } = usePatients();
    
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [prescription, setPrescription] = useState({
        diagnosis: '',
        notes: '',
    });
    
    const [medications, setMedications] = useState<Medication[]>([{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1,
    }]);

    
    useEffect(() => {
        fetchPatientDetails();
    }, [patientId]);

    const fetchPatientDetails = async () => {
        try {
            setLoading(true);
            const result = await getPatientDetails(patientId as string);
            if (result.success && result.data) {
                setPatient(result.data.patient);
            } else {
                Alert.alert('Error', 'Failed to load patient details');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load patient details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const addMedication = () => {
        setMedications([...medications, {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            quantity: 1,
        }]);
    };

    const removeMedication = (index: number) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
        const updated = medications.map((med, i) => 
            i === index ? { ...med, [field]: value } : med
        );
        setMedications(updated);
    };

    const validateForm = () => {
        if (!prescription.diagnosis.trim()) {
            Alert.alert('Error', 'Please enter a diagnosis');
            return false;
        }

        for (let i = 0; i < medications.length; i++) {
            const med = medications[i];
            if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()) {
                Alert.alert('Error', `Please complete all required fields for medication ${i + 1}`);
                return false;
            }
            if (med.quantity <= 0) {
                Alert.alert('Error', `Please enter a valid quantity for medication ${i + 1}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            
            const result = await createPrescription({
                patientId: patientId as string,
                medications,
                diagnosis: prescription.diagnosis,
                notes: prescription.notes || undefined,
            });

            if (result.success) {
                Alert.alert(
                    'Success', 
                    'Prescription created successfully', 
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to create prescription');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create prescription');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading patient details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Patient Info Header */}
                    <View style={styles.patientHeader}>
                        <View style={styles.patientAvatar}>
                            <Text style={styles.avatarText}>
                                {patient?.firstName?.charAt(0)}{patient?.lastName?.charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>
                                {patient?.firstName} {patient?.lastName}
                            </Text>
                            <Text style={styles.patientContact}>{patient?.email}</Text>
                            <Text style={styles.patientContact}>{patient?.phone}</Text>
                        </View>
                    </View>

                    {/* Diagnosis Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Diagnosis *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={prescription.diagnosis}
                            onChangeText={(text) => setPrescription(prev => ({ ...prev, diagnosis: text }))}
                            placeholder="Enter diagnosis"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Medications Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Medications</Text>
                            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
                                <Ionicons name="add" size={20} color="#007AFF" />
                                <Text style={styles.addButtonText}>Add Medication</Text>
                            </TouchableOpacity>
                        </View>

                        {medications.map((medication, index) => (
                            <View key={index} style={styles.medicationCard}>
                                <View style={styles.medicationHeader}>
                                    <Text style={styles.medicationTitle}>Medication {index + 1}</Text>
                                    {medications.length > 1 && (
                                        <TouchableOpacity 
                                            onPress={() => removeMedication(index)}
                                            style={styles.removeButton}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Medication Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={medication.name}
                                        onChangeText={(text) => updateMedication(index, 'name', text)}
                                        placeholder="e.g., Amoxicillin"
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={styles.label}>Dosage *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={medication.dosage}
                                            onChangeText={(text) => updateMedication(index, 'dosage', text)}
                                            placeholder="e.g., 500mg"
                                        />
                                    </View>

                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={styles.label}>Quantity *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={medication.quantity.toString()}
                                            onChangeText={(text) => updateMedication(index, 'quantity', parseInt(text) || 0)}
                                            placeholder="e.g., 30"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Frequency *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={medication.frequency}
                                        onChangeText={(text) => updateMedication(index, 'frequency', text)}
                                        placeholder="e.g., 3 times daily"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Duration *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={medication.duration}
                                        onChangeText={(text) => updateMedication(index, 'duration', text)}
                                        placeholder="e.g., 7 days"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Instructions</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={medication.instructions}
                                        onChangeText={(text) => updateMedication(index, 'instructions', text)}
                                        placeholder="Additional instructions (e.g., take with food)"
                                        multiline
                                        numberOfLines={2}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Notes Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={prescription.notes}
                            onChangeText={(text) => setPrescription(prev => ({ ...prev, notes: text }))}
                            placeholder="Additional notes or instructions"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="medical" size={20} color="#fff" style={styles.submitIcon} />
                                <Text style={styles.submitButtonText}>Create Prescription</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    patientHeader: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    patientAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    patientInfo: {
        marginLeft: 16,
        flex: 1,
    },
    patientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    patientContact: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    addButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    medicationCard: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#F9F9F9',
    },
    medicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    medicationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    removeButton: {
        padding: 4,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 32,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#999',
    },
    submitIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});