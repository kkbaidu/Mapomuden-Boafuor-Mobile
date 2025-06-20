import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const user = {
    name: 'Kingsley Boafuor',
    email: 'kingsley@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Kingsley+Boafuor',
};

export default function ProfileScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>

            <View style={styles.section}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.logoutButton]}>
                    <Text style={[styles.buttonText, styles.logoutText]}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: 16,
        backgroundColor: '#eee',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    section: {
        width: '100%',
        marginTop: 16,
    },
    button: {
        backgroundColor: '#1976d2',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d32f2f',
    },
    logoutText: {
        color: '#d32f2f',
    },
});