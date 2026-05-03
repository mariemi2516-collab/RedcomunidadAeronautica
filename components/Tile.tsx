import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type TileProps = {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  href?: string;
  onPress?: () => void;
  accent?: string;
  size?: "md" | "lg";
};

export function Tile({ label, icon, href, onPress, accent, size = "md" }: TileProps) {
  const colors = useColors();
  const tint = accent ?? colors.primary;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    if (onPress) onPress();
    else if (href) router.push(href as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          height: size === "lg" ? 130 : 110,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: tint + "1F",
            borderRadius: colors.radius - 4,
          },
        ]}
      >
        <Feather name={icon} size={22} color={tint} />
      </View>
      <Text
        style={[styles.label, { color: colors.foreground }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.86}
      >
        {label}
      </Text>
      <View style={[styles.bar, { backgroundColor: tint }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
});
