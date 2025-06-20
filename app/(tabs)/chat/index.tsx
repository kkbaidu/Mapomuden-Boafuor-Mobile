import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'other';
}

const initialMessages: Message[] = [
    { id: '1', text: 'Hello! How can I help you?', sender: 'other' },
    { id: '2', text: 'Hi! I have a question.', sender: 'me' },
];

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (input.trim() === '') return;
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), text: input, sender: 'me' },
        ]);
        setInput('');
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageContainer,
                item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            ]}
        >
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                inverted
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { flexGrow: 1, justifyContent: 'flex-end', padding: 16 },
    messageContainer: {
        marginVertical: 4,
        maxWidth: '75%',
        borderRadius: 16,
        padding: 10,
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#ECECEC',
        alignSelf: 'flex-start',
    },
    messageText: { fontSize: 16 },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fafafa',
    },
    input: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: { color: '#fff', fontWeight: 'bold' },
});