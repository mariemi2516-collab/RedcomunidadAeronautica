import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { useColors } from "@/hooks/useColors";

type Station = { id: string; label: string; weight: string; arm: string };

const DEFAULT_STATIONS: Station[] = [
  { id: "bem", label: "Peso vacío (BEM)", weight: "525", arm: "0.85" },
  { id: "p1", label: "Piloto + acompañante", weight: "150", arm: "0.99" },
  { id: "fuel", label: "Combustible (kg)", weight: "75", arm: "1.07" },
  { id: "bag", label: "Equipaje", weight: "10", arm: "1.85" },
];

const MAX_WEIGHT = 757;
const CG_FWD = 0.78;
const CG_AFT = 1.04;

export default function PesoBalanceScreen() {
  const colors = useColors();
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);

  const update = (id: string, field: "weight" | "arm", v: string) =>
    setStations((s) => s.map((st) => (st.id === id ? { ...st, [field]: v } : st)));

  const totals = useMemo(() => {
    let totalW = 0;
    let totalM = 0;
    for (const st of stations) {
      const w = Number(st.weight) || 0;
      const a = Number(st.arm) || 0;
      totalW += w;
      totalM += w * a;
    }
    const cg = totalW > 0 ? totalM / totalW : 0;
    return { totalW, totalM, cg };
  }, [stations]);

  const overWeight = totals.totalW > MAX_WEIGHT;
  const cgOk = totals.cg >= CG_FWD && totals.cg <= CG_AFT;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Plantilla referencial Cessna 152. Reemplazá los valores con los de tu
        POH/AFM antes del despegue.
      </Text>

      {stations.map((st) => (
        <View
          key={st.id}
          style={[
            styles.row,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius - 2,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.foreground }]}>
            {st.label}
          </Text>
          <View style={styles.inputs}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Peso (kg)"
                value={st.weight}
                onChangeText={(v) => update(st.id, "weight", v)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Brazo (m)"
                value={st.arm}
                onChangeText={(v) => update(st.id, "arm", v)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      ))}

      <View
        style={[
          styles.results,
          {
            backgroundColor: overWeight || !cgOk ? colors.destructive + "1A" : colors.card,
            borderColor: overWeight || !cgOk ? colors.destructive : colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Result label="Peso total" value={`${totals.totalW.toFixed(1)} kg`} />
        <Result
          label="Momento total"
          value={`${totals.totalM.toFixed(2)} kg·m`}
        />
        <Result label="CG" value={`${totals.cg.toFixed(3)} m`} highlight />
        <Text
          style={[
            styles.verdict,
            {
              color: overWeight || !cgOk ? colors.destructive : colors.success,
            },
          ]}
        >
          {overWeight
            ? `EXCEDE peso máximo (${MAX_WEIGHT} kg)`
            : !cgOk
              ? `CG fuera de límites (${CG_FWD}–${CG_AFT} m)`
              : "Dentro de límites"}
        </Text>
      </View>
    </ScrollView>
  );
}

function Result({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.resRow}>
      <Text style={[styles.resLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.resValue,
          {
            color: highlight ? colors.primary : colors.foreground,
            fontFamily: highlight ? "Inter_700Bold" : "Inter_600SemiBold",
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  row: { padding: 14, borderWidth: 1, gap: 10 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  inputs: { flexDirection: "row", gap: 10 },
  results: { padding: 18, borderWidth: 1, gap: 10 },
  resRow: { flexDirection: "row", justifyContent: "space-between" },
  resLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  resValue: { fontSize: 16 },
  verdict: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
