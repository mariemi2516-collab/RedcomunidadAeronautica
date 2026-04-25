import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { LinkRow } from "@/components/LinkRow";
import { useColors } from "@/hooks/useColors";
import { planificacionLinks } from "@/lib/links";

export default function PlanificacionScreen() {
  const colors = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 18 }}
    >
      {planificacionLinks.map((sec) => (
        <View key={sec.title} style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {sec.title.toUpperCase()}
          </Text>
          {sec.description ? (
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>
              {sec.description}
            </Text>
          ) : null}
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
  desc: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
