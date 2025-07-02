import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface Appointment {
    id: string;
    patientName: string;
    patientAge: number;
    appointmentDate: string;
    appointmentTime: string;
    symptoms: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

export default function AppointmentDetails() {
    const { id } = useLocalSearchParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [id]);

    const fetchAppointmentDetails = async () => {
        try {
            // Replace with your API call
            // const response = await fetch(`/api/appointments/${id}`);
            // const data = await response.json();
            
            // Mock data for demonstration
            const mockAppointment: Appointment = {
                id: id as string,
                patientName: 'John Doe',
                patientAge: 35,
                appointmentDate: '2024-01-15',
                appointmentTime: '10:00 AM',
                symptoms: 'Fever, headache, body aches',
                status: 'pending',
                notes: 'Patient reports symptoms for 3 days'
            };
            
            setAppointment(mockAppointment);
        } catch (error) {
            console.error('Error fetching appointment:', error);
            Alert.alert('Error', 'Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (status: Appointment['status']) => {
        try {
            // Replace with your API call
            // await fetch(`/api/appointments/${id}`, {
            //   method: 'PATCH',
            //   body: JSON.stringify({ status })
            // });
            
            setAppointment(prev => prev ? { ...prev, status } : null);
            Alert.alert('Success', `Appointment ${status} successfully`);
        } catch (error) {
            console.error('Error updating appointment:', error);
            Alert.alert('Error', 'Failed to update appointment');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#4CAF50';
            case 'completed': return '#2196F3';
            case 'cancelled': return '#F44336';
            default: return '#FF9800';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading appointment details...</Text>
            </View>
        );
    }

    if (!appointment) {
        return (
            <View style={styles.errorContainer}>
                <Text>Appointment not found</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Appointment Details</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                    <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{appointment.patientName}</Text>
                <Text style={styles.label}>Age:</Text>
                <Text style={styles.value}>{appointment.patientAge} years</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appointment Details</Text>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{appointment.appointmentDate}</Text>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{appointment.appointmentTime}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Symptoms</Text>
                <Text style={styles.value}>{appointment.symptoms}</Text>
            </View>

            {appointment.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.value}>{appointment.notes}</Text>
                </View>
            )}

            <View style={styles.actionButtons}>
                {appointment.status === 'pending' && (
                    <>
                        <TouchableOpacity 
                            style={[styles.button, styles.confirmButton]}
                            onPress={() => updateAppointmentStatus('confirmed')}
                        >
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => updateAppointmentStatus('cancelled')}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                )}
                
                {appointment.status === 'confirmed' && (
                    <TouchableOpacity 
                        style={[styles.button, styles.completeButton]}
                        onPress={() => updateAppointmentStatus('completed')}
                    >
                        <Text style={styles.buttonText}>Mark as Completed</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginBottom: 32,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    completeButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});