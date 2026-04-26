import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type LinkRowProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  url?: string;
  route?: string;
  onPress?: () => void;
  rightIcon?: React.ComponentProps<typeof Feather>["name"];
};

export function LinkRow({
  title,
  subtitle,
  badge,
  url,
  route,
  onPress,
  rightIcon,
}: LinkRowProps) {
  const colors = useColors();
  const router = useRouter();

  const isInternal = !!route;
  const icon = rightIcon ?? (isInternal ? "chevron-right" : "external-link");

  const handlePress = async () => {
    if (onPress) onPress();
    else if (route) {
      router.push(route as never);
    } else if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.primary + "26",
                  borderRadius: 6,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name={icon} size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  textBlock: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15, flexShrink: 1 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
