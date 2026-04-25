import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function EmptyState({
  icon = "inbox",
  title,
  description,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.secondary,
            borderRadius: 999,
          },
        ]}
      >
        <Feather name={icon} size={24} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
  },
});
