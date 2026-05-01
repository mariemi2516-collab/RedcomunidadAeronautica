import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function NotamScreen() {
  const colors = useColors();

  useEffect(() => {
    Linking.openURL("https://ais.anac.gob.ar/notam").catch(() => {});
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        Abriendo NOTAM Argentina...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
