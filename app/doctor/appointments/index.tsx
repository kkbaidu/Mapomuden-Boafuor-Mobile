import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Appointment {
    id: string;
    patientName: string;
    time: string;
    date: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export default function DoctorAppointments() {
    const appointments: Appointment[] = [
        {
            id: '1',
            patientName: 'John Doe',
            time: '09:00 AM',
            date: '2024-01-15',
            status: 'scheduled'
        },
        {
            id: '2',
            patientName: 'Jane Smith',
            time: '10:30 AM',
            date: '2024-01-15',
            status: 'scheduled'
        }
    ];

    const renderAppointment = ({ item }: { item: Appointment }) => (
        <View style={styles.appointmentCard}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                {item.status.toUpperCase()}
            </Text>
        </View>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return '#007AFF';
            case 'completed': return '#34C759';
            case 'cancelled': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Appointments</Text>
            <FlatList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    listContainer: {
        padding: 16,
    },
    appointmentCard: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    time: {
        fontSize: 16,
        color: '#666',
        marginBottom: 2,
    },
    date: {
        fontSize: 14,
        color: '#999',
        marginBottom: 8,
    },
    status: {
        fontSize: 12,
        fontWeight: '500',
    },
});