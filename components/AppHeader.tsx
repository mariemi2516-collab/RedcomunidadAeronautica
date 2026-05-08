import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/images/icon.png");

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  compact?: boolean;
};

export function AppHeader({
  title = "Red de Comunidad Aeronáutica",
  subtitle,
  showBack,
  right,
  compact,
}: Props) {
  const colors = useColors();
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </Pressable>
      ) : null}
      <View
        style={[
          styles.logoWrap,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
          },
        ]}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.brand, { color: colors.primary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.sub, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  rowCompact: { paddingTop: 4 },
  logoWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  logo: { width: 28, height: 28 },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  sub: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 999,
  },
});
