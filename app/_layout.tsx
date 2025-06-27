import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import "../global.css";

import { AuthGuard } from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { MedicalRecordsProvider } from "@/contexts/MedicalRecordsContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <MedicalRecordsProvider>
        {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
          <AuthGuard>
            <Stack>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="doctor" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
          <StatusBar style="auto" />
        {/* </ThemeProvider> */}
      </MedicalRecordsProvider>
    </AuthProvider>
  );
}