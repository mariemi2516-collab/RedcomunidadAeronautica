import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { LinkRow } from "@/components/LinkRow";
import { MetarCard } from "@/components/MetarCard";
import { useColors } from "@/hooks/useColors";
import { meteorologiaLinks } from "@/lib/links";

export default function MeteorologiaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 160, gap: 16 }}
    >
      <MetarCard />
      {meteorologiaLinks.map((sec) => (
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
