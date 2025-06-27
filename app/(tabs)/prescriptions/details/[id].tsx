import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PrescriptionDetails = () => {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = React.useState(true);
    const [prescription, setPrescription] = React.useState<any>(null);

    React.useEffect(() => {
        // Replace with your data fetching logic
        const fetchPrescription = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setPrescription({
                    id,
                    name: 'Amoxicillin 500mg',
                    dosage: '1 tablet every 8 hours',
                    prescribedBy: 'Dr. Mensah',
                    date: '2024-06-01',
                    notes: 'Take after meals',
                });
                setLoading(false);
            }, 1000);
        };
        fetchPrescription();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!prescription) {
        return (
            <View style={styles.center}>
                <Text>Prescription not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{prescription.name}</Text>
            <Text style={styles.label}>Dosage:</Text>
            <Text style={styles.value}>{prescription.dosage}</Text>
            <Text style={styles.label}>Prescribed By:</Text>
            <Text style={styles.value}>{prescription.prescribedBy}</Text>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{prescription.date}</Text>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.value}>{prescription.notes}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    label: {
        fontWeight: '600',
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        marginBottom: 4,
    },
});

export default PrescriptionDetails;