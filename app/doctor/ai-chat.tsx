import { useAuthContext } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const base_url =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "text" | "image";
  metadata?: {
    aiModel?: string;
    confidence?: number;
  };
}

export default function AIChatScreen() {
  const { token, isAuthenticated, user } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || user.role !== "doctor") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Access denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      type: "text",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText("");
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      // Get auth token
      const { getItemAsync } = await import("expo-secure-store");
      const token = await getItemAsync("token");

      const response = await fetch(`${base_url}/doctors/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get AI response");
      }

      const data = await response.json();

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: data.response,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Chat error:", error);
      Alert.alert("Error", "Failed to get AI response. Please try again.");

      // Remove user message on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user";

    return (
      <View
        key={message.id}
        className={`mb-4 ${isUser ? "items-end" : "items-start"}`}
      >
        <View className="flex-row items-end max-w-[80%]">
          {!isUser && (
            <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 items-center justify-center mr-2">
              <Ionicons name="medical" size={16} color="white" />
            </View>
          )}

          <View>
            <View
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? "bg-blue-600 rounded-br-md"
                  : "bg-gray-100 rounded-bl-md border border-gray-200"
              }`}
            >
              <Markdown
                style={{
                  body: {
                    color: isUser ? "#FFFFFF" : "#1F2937",
                    fontSize: 16,
                    lineHeight: 20,
                  },
                  bullet_list: { paddingLeft: 10 },
                  ordered_list: { paddingLeft: 10 },
                }}
              >
                {message.content}
              </Markdown>
            </View>

            <Text
              className={`text-xs text-gray-500 mt-1 ${
                isUser ? "text-right" : "text-left"
              }`}
            >
              {formatTime(message.timestamp)}
              {message.metadata?.confidence && (
                <Text className="ml-2">
                  • {Math.round(message.metadata.confidence * 1)}% confidence
                </Text>
              )}
            </Text>
          </View>

          {isUser && (
            <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center ml-2">
              <Ionicons name="person" size={16} color="white" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View className="mb-4 items-start">
        <View className="flex-row items-end max-w-[80%]">
          <View className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 items-center justify-center mr-2">
            <Ionicons name="medical" size={16} color="white" />
          </View>

          <View className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-gray-600 ml-2">AI is thinking...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Medical Assistant</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="never"
        >
          {messages.map(renderMessage)}
          {renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom:
                Math.max(insets.bottom, 10) + (Platform.OS === "ios" ? 85 : 65),
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <View style={styles.textInputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about medical practice, diagnoses, treatments..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.textInput}
                maxLength={1000}
              />
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    inputText.trim() && !isTyping ? "#2563EB" : "#D1D5DB",
                },
              ]}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            AI Medical Assistant for healthcare professionals. Always verify
            recommendations with current medical guidelines.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  textInputContainer: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "center",
    minHeight: 28,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 8,
  },
});
