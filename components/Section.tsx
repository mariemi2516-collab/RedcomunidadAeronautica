import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function SectionTitle({
  title,
  caption,
  right,
}: {
  title: string;
  caption?: string;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {caption ? (
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>
            {caption}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function StatPill({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  const colors = useColors();
  const c = tint ?? colors.primary;
  return (
    <View
      style={[
        styles.stat,
        { borderColor: colors.border, borderRadius: colors.radius - 2 },
      ]}
    >
      <Text style={[styles.statValue, { color: c }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  stat: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
