import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Tool = {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  href: string;
  tint: string;
};

const TOOLS: Tool[] = [
 // {
   // id: "wb",
    //title: "Peso y balance",
    //desc: "Cálculo W&B con CG por estación.",
    //icon: "sliders",
    //href: "/calc/peso-balance",
    //tint: "#FFB547",
  //},
  {
    id: "da",
    title: "Densidad de altitud",
    desc: "DA según QNH, OAT y elevación.",
    icon: "trending-up",
    href: "/calc/densidad-altitud",
    tint: "#4DA3FF",
  },
  {
    id: "fuel",
    title: "Consumo de combustible",
    desc: "Autonomía, reserva y consumo.",
    icon: "droplet",
    href: "/calc/combustible",
    tint: "#34D399",
  },
  {
    id: "conv",
    title: "Conversor aeronáutico",
    desc: "Unidades comunes en aviación.",
    icon: "repeat",
    href: "/calc/conversor",
    tint: "#A78BFA",
  },
  {
    id: "caudal",
    title: "Cálculo de caudal",
    desc: "Trabajo aéreo: fumigación y aplicaciones.",
    icon: "wind",
    href: "/calc/caudal",
    tint: "#F472B6",
  },
];

export default function HerramientasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 160,
        paddingHorizontal: 20,
        gap: 12,
      }}
    >
      <View style={{ marginBottom: 6 }}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          CALCULADORAS OPERATIVAS
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Herramientas
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Cálculos rápidos para planificación y operación.
        </Text>
      </View>

      {TOOLS.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => router.push(t.href as never)}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: t.tint + "1F", borderRadius: colors.radius - 4 },
            ]}
          >
            <Feather name={t.icon} size={22} color={t.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>
              {t.title}
            </Text>
            <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>
              {t.desc}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 4,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  rowDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
