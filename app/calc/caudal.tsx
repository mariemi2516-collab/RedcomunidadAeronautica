import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { useColors } from "@/hooks/useColors";

type Mode = "vol-tiempo" | "vol-caudal" | "tiempo-caudal";

const MODES: { id: Mode; label: string; out: string }[] = [
  { id: "vol-tiempo", label: "Volumen + Tiempo", out: "Caudal" },
  { id: "vol-caudal", label: "Volumen + Caudal", out: "Tiempo" },
  { id: "tiempo-caudal", label: "Tiempo + Caudal", out: "Volumen" },
];

export default function CaudalScreen() {
  const colors = useColors();
  const [mode, setMode] = useState<Mode>("vol-tiempo");
  const [a, setA] = useState("100");
  const [b, setB] = useState("4");

  const result = useMemo(() => {
    const x = Number(a) || 0;
    const y = Number(b) || 0;
    if (mode === "vol-tiempo") return y > 0 ? x / y : 0;
    if (mode === "vol-caudal") return y > 0 ? x / y : 0;
    return x * y;
  }, [a, b, mode]);

  const labels = useMemo(() => {
    if (mode === "vol-tiempo") return { a: "Volumen (lts)", b: "Tiempo (min)", r: "Caudal (lts/min)" };
    if (mode === "vol-caudal") return { a: "Volumen (lts)", b: "Caudal (lts/min)", r: "Tiempo (min)" };
    return { a: "Tiempo (min)", b: "Caudal (lts/min)", r: "Volumen (lts)" };
  }, [mode]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Calcula caudal de combustible o agua para reabastecimiento, riego de
        pista o aspersión agroaérea.
      </Text>

      <View style={styles.modes}>
        {MODES.map((m) => {
          const active = m.id === mode;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMode(m.id)}
              style={({ pressed }) => [
                styles.modeChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: colors.radius - 4,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: active ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FormField label={labels.a} value={a} onChangeText={setA} keyboardType="decimal-pad" />
      <FormField label={labels.b} value={b} onChangeText={setB} keyboardType="decimal-pad" />

      <View
        style={[
          styles.results,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.resLabel, { color: colors.mutedForeground }]}>
          {labels.r.toUpperCase()}
        </Text>
        <Text style={[styles.resBig, { color: colors.primary }]}>
          {result.toLocaleString("es-AR", { maximumFractionDigits: 3 })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  modes: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
  },
  modeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  results: { padding: 22, borderWidth: 1, gap: 8, alignItems: "center" },
  resLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  resBig: { fontFamily: "Inter_700Bold", fontSize: 28 },
});
