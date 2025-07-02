import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CreatePrescription() {
    const { patientId } = useLocalSearchParams();
    const router = useRouter();
    
    const [prescription, setPrescription] = useState({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
    });

    const handleSubmit = () => {
        if (!prescription.medication || !prescription.dosage || !prescription.frequency) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        
        // TODO: Submit prescription to API
        console.log('Creating prescription for patient:', patientId, prescription);
        Alert.alert('Success', 'Prescription created successfully', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create Prescription</Text>
            <Text style={styles.subtitle}>Patient ID: {patientId}</Text>
            
            <View style={styles.form}>
                <Text style={styles.label}>Medication *</Text>
                <TextInput
                    style={styles.input}
                    value={prescription.medication}
                    onChangeText={(text) => setPrescription(prev => ({ ...prev, medication: text }))}
                    placeholder="Enter medication name"
                />
                
                <Text style={styles.label}>Dosage *</Text>
                <TextInput
                    style={styles.input}
                    value={prescription.dosage}
                    onChangeText={(text) => setPrescription(prev => ({ ...prev, dosage: text }))}
                    placeholder="e.g., 500mg"
                />
                
                <Text style={styles.label}>Frequency *</Text>
                <TextInput
                    style={styles.input}
                    value={prescription.frequency}
                    onChangeText={(text) => setPrescription(prev => ({ ...prev, frequency: text }))}
                    placeholder="e.g., Twice daily"
                />
                
                <Text style={styles.label}>Duration</Text>
                <TextInput
                    style={styles.input}
                    value={prescription.duration}
                    onChangeText={(text) => setPrescription(prev => ({ ...prev, duration: text }))}
                    placeholder="e.g., 7 days"
                />
                
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={prescription.instructions}
                    onChangeText={(text) => setPrescription(prev => ({ ...prev, instructions: text }))}
                    placeholder="Additional instructions"
                    multiline
                    numberOfLines={4}
                />
                
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Prescription</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});