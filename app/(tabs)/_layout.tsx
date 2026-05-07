import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          letterSpacing: 0.4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="grid" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vuelos"
        options={{
          title: "Vuelos",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="navigation" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: "Comunidad",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="herramientas"
        options={{
          title: "Calculos",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="sliders" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notam"
        options={{
          href: null,
          title: "NOTAM",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="alert-triangle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: "SOS",
          tabBarActiveTintColor: colors.destructive,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <View
              style={[
                styles.sosBubble,
                {
                  backgroundColor: colors.destructive,
                  borderColor: focused
                    ? colors.destructiveForeground
                    : "transparent",
                },
              ]}
            >
              <Feather
                name="alert-octagon"
                size={18}
                color={colors.destructiveForeground}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sosBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginTop: -2,
  },
});
