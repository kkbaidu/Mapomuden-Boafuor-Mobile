import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Appointment = {
    id: string;
    title: string;
    date: string;
    time: string;
};

const appointments: Appointment[] = [
    { id: '1', title: 'Dental Checkup', date: '2024-06-10', time: '10:00 AM' },
    { id: '2', title: 'Eye Examination', date: '2024-06-12', time: '2:00 PM' },
    { id: '3', title: 'General Consultation', date: '2024-06-15', time: '11:30 AM' },
];

const AppointmentsScreen: React.FC = () => {
    const renderItem = ({ item }: { item: Appointment }) => (
        <TouchableOpacity style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.datetime}>{item.date} at {item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Appointments</Text>
            <FlatList
                data={appointments}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>No appointments found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    datetime: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 32,
        fontSize: 16,
    },
});

export default AppointmentsScreen;