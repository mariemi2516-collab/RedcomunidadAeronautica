import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { useColors } from "@/hooks/useColors";

type Category = "longitud" | "peso" | "volumen" | "velocidad" | "presion" | "temperatura";

const CATS: { id: Category; label: string }[] = [
  { id: "longitud", label: "Longitud" },
  { id: "peso", label: "Peso" },
  { id: "volumen", label: "Volumen" },
  { id: "velocidad", label: "Velocidad" },
  { id: "presion", label: "Presión" },
  { id: "temperatura", label: "Temp." },
];

const UNITS: Record<Category, { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  longitud: [
    { id: "m", label: "metros", toBase: (v) => v, fromBase: (v) => v },
    { id: "ft", label: "pies", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: "nm", label: "MN", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    { id: "km", label: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: "mi", label: "millas", toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
  ],
  peso: [
    { id: "kg", label: "kg", toBase: (v) => v, fromBase: (v) => v },
    { id: "lb", label: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  ],
  volumen: [
    { id: "lts", label: "litros", toBase: (v) => v, fromBase: (v) => v },
    { id: "gal", label: "galones US", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { id: "qt", label: "cuartos US", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
  ],
  velocidad: [
    { id: "kt", label: "nudos", toBase: (v) => v, fromBase: (v) => v },
    { id: "kmh", label: "km/h", toBase: (v) => v / 1.852, fromBase: (v) => v * 1.852 },
    { id: "mph", label: "mph", toBase: (v) => v / 1.15078, fromBase: (v) => v * 1.15078 },
    { id: "ms", label: "m/s", toBase: (v) => v / 0.514444, fromBase: (v) => v * 0.514444 },
  ],
  presion: [
    { id: "hpa", label: "hPa", toBase: (v) => v, fromBase: (v) => v },
    { id: "inhg", label: "inHg", toBase: (v) => v * 33.8639, fromBase: (v) => v / 33.8639 },
    { id: "mb", label: "mb", toBase: (v) => v, fromBase: (v) => v },
  ],
  temperatura: [
    { id: "c", label: "°C", toBase: (v) => v, fromBase: (v) => v },
    { id: "f", label: "°F", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { id: "k", label: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
};

export default function ConversorScreen() {
  const colors = useColors();
  const [cat, setCat] = useState<Category>("longitud");
  const [from, setFrom] = useState("ft");
  const [to, setTo] = useState("m");
  const [val, setVal] = useState("1000");

  const units = UNITS[cat];
  const fromU = units.find((u) => u.id === from) ?? units[0];
  const toU = units.find((u) => u.id === to) ?? units[1] ?? units[0];
  const result = toU.fromBase(fromU.toBase(Number(val) || 0));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CATS.map((c) => {
          const active = c.id === cat;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setCat(c.id);
                const u = UNITS[c.id];
                setFrom(u[0].id);
                setTo(u[1]?.id ?? u[0].id);
              }}
              style={({ pressed }) => [
                styles.catChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  { color: active ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FormField
        label="Valor"
        value={val}
        onChangeText={setVal}
        keyboardType="decimal-pad"
      />

      <View>
        <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>DE</Text>
        <View style={styles.unitRow}>
          {units.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => setFrom(u.id)}
              style={({ pressed }) => [
                styles.unitChip,
                {
                  backgroundColor: from === u.id ? colors.accent : colors.secondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: from === u.id ? colors.accentForeground : colors.foreground },
                ]}
              >
                {u.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>A</Text>
        <View style={styles.unitRow}>
          {units.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => setTo(u.id)}
              style={({ pressed }) => [
                styles.unitChip,
                {
                  backgroundColor: to === u.id ? colors.accent : colors.secondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: to === u.id ? colors.accentForeground : colors.foreground },
                ]}
              >
                {u.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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
        <Text style={[styles.resLabel, { color: colors.mutedForeground }]}>RESULTADO</Text>
        <Text style={[styles.resBig, { color: colors.primary }]}>
          {result.toLocaleString("es-AR", { maximumFractionDigits: 4 })} {toU.label}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  catText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  unitText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  results: { padding: 20, borderWidth: 1, gap: 8, alignItems: "center" },
  resLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  resBig: { fontFamily: "Inter_700Bold", fontSize: 22 },
});
