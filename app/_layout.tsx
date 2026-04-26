import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppDataProvider } from "@/contexts/AppDataContext";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.dark.background).catch(() => {});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.background },
        headerTintColor: colors.dark.foreground,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
        },
        contentStyle: { backgroundColor: colors.dark.background },
        headerBackTitle: "Atrás",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="disclaimer"
        options={{
          presentation: "modal",
          title: "Aviso legal",
        }}
      />
      <Stack.Screen name="meteorologia" options={{ title: "Meteorología" }} />
      <Stack.Screen name="trafico" options={{ title: "Tráfico en vivo" }} />
      <Stack.Screen name="aeropuertos" options={{ title: "Aeródromos" }} />
      <Stack.Screen name="aeroclub" options={{ title: "Mi aeroclub" }} />
      <Stack.Screen name="biblioteca" options={{ title: "Biblioteca normativa" }} />
      <Stack.Screen name="comerciales" options={{ title: "Vuelos comerciales" }} />
      <Stack.Screen name="directorio" options={{ title: "Directorio operativo" }} />
      <Stack.Screen
        name="bitacora-nueva"
        options={{ presentation: "modal", title: "Nuevo vuelo" }}
      />
      <Stack.Screen
        name="planificacion"
        options={{ title: "Planificación y trámites" }}
      />
      <Stack.Screen
        name="calc/peso-balance"
        options={{ title: "Peso y balance" }}
      />
      <Stack.Screen
        name="calc/densidad-altitud"
        options={{ title: "Densidad de altitud" }}
      />
      <Stack.Screen
        name="calc/combustible"
        options={{ title: "Combustible" }}
      />
      <Stack.Screen name="calc/conversor" options={{ title: "Conversor" }} />
      <Stack.Screen name="calc/caudal" options={{ title: "Cálculo de caudal" }} />
      <Stack.Screen
        name="fpl-form"
        options={{ title: "Plan de vuelo — FPL" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppDataProvider>
          <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: colors.dark.background }}
          >
            <KeyboardProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppDataProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
