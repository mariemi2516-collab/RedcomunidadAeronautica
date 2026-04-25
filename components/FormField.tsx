import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export function FormField({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
            borderRadius: colors.radius - 4,
          },
          props.style,
        ]}
      />
      {hint ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    minHeight: 48,
  },
  hint: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
