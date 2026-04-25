import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "primary",
  loading,
  disabled,
  full,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
}) {
  const colors = useColors();

  const palette = (() => {
    switch (variant) {
      case "secondary":
        return { bg: colors.secondary, fg: colors.foreground, border: colors.border };
      case "ghost":
        return { bg: "transparent", fg: colors.foreground, border: colors.border };
      case "destructive":
        return {
          bg: colors.destructive,
          fg: colors.destructiveForeground,
          border: colors.destructive,
        };
      default:
        return {
          bg: colors.primary,
          fg: colors.primaryForeground,
          border: colors.primary,
        };
    }
  })();

  const isDisabled = !!disabled || !!loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: colors.radius - 2,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          alignSelf: full ? "stretch" : "flex-start",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={16} color={palette.fg} /> : null}
          <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 15, letterSpacing: 0.3 },
});
