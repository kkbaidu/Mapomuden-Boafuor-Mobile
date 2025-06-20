import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Prescription = {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
};

const prescriptions: Prescription[] = [
    { id: '1', name: 'Amoxicillin', dosage: '500mg', frequency: '3 times a day' },
    { id: '2', name: 'Ibuprofen', dosage: '200mg', frequency: '2 times a day' },
    // Add more prescriptions as needed
];

const PrescriptionItem = ({ item }: { item: Prescription }) => (
    <View style={styles.itemContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>{item.dosage} • {item.frequency}</Text>
    </View>
);

export default function PrescriptionsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Prescriptions</Text>
            <FlatList
                data={prescriptions}
                keyExtractor={item => item.id}
                renderItem={PrescriptionItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No prescriptions found.</Text>}
            />
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add Prescription</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    list: { flexGrow: 1 },
    itemContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    name: { fontSize: 18, fontWeight: '600' },
    details: { fontSize: 14, color: '#555', marginTop: 4 },
    empty: { textAlign: 'center', color: '#888', marginTop: 32 },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});