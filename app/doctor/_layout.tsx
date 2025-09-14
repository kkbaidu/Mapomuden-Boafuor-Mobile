// app/doctor/_layout.tsx
import { Tabs, Redirect } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function DoctorLayout() {
  const { isLoading, isAuthenticated, user } = useAuthContext();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated || user?.role !== "doctor") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#6b7280",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(248,250,252,0.95)"]}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ),
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#ffffff" : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome5
                name="calendar-alt"
                size={24}
                color={focused ? "#ffffff" : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={focused ? "#ffffff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="ai-chat"
        options={{
          // title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
                color={focused ? "#ffffff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? "#ffffff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="prescriptions"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 85 : 65,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: "transparent",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#10B981",
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
