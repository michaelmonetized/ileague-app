import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Providers } from "@/providers";
import "../global.css";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  tracesSampleRate: 1.0,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}

export default Sentry.wrap(RootLayout);
