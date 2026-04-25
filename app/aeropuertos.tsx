import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { LinkRow } from "@/components/LinkRow";
import { useColors } from "@/hooks/useColors";
import { aeropuertosLinks } from "@/lib/links";

export default function AeropuertosScreen() {
  const colors = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 18 }}
    >
      {aeropuertosLinks.map((sec) => (
        <View key={sec.title} style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {sec.title.toUpperCase()}
          </Text>
          {sec.items.map((item) => (
            <LinkRow key={item.id} {...item} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
});
