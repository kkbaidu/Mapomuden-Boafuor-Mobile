import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prescription {
    id: string;
    patientName: string;
    medication: string;
    dosage: string;
    frequency: string;
    date: string;
    status: 'active' | 'completed' | 'pending';
}

const PrescriptionsIndex: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        try {
            // Replace with actual API call
            const mockData: Prescription[] = [
                {
                    id: '1',
                    patientName: 'John Doe',
                    medication: 'Amoxicillin',
                    dosage: '500mg',
                    frequency: '3 times daily',
                    date: '2024-01-15',
                    status: 'active'
                },
                {
                    id: '2',
                    patientName: 'Jane Smith',
                    medication: 'Ibuprofen',
                    dosage: '200mg',
                    frequency: 'As needed',
                    date: '2024-01-14',
                    status: 'completed'
                }
            ];
            setPrescriptions(mockData);
        } catch (error) {
            Alert.alert('Error', 'Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
        <TouchableOpacity style={styles.prescriptionCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.medication}>{item.medication} - {item.dosage}</Text>
            <Text style={styles.frequency}>{item.frequency}</Text>
            <Text style={styles.date}>Prescribed: {item.date}</Text>
        </TouchableOpacity>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'completed': return '#2196F3';
            case 'pending': return '#FF9800';
            default: return '#757575';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading prescriptions...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Prescriptions</Text>
            <FlatList
                data={prescriptions}
                renderItem={renderPrescriptionItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    prescriptionCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    medication: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginBottom: 4,
    },
    frequency: {
        fontSize: 14,
        color: '#777',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50,
    },
});

export default PrescriptionsIndex;