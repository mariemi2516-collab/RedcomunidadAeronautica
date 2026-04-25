import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { useColors } from "@/hooks/useColors";

export default function DensidadAltitudScreen() {
  const colors = useColors();
  const [elev, setElev] = useState("100");
  const [qnh, setQnh] = useState("1013");
  const [oat, setOat] = useState("25");

  const result = useMemo(() => {
    const e = Number(elev) || 0;
    const q = Number(qnh) || 1013;
    const t = Number(oat) || 0;
    const pressureAlt = e + (1013 - q) * 30;
    const isaTemp = 15 - 0.00198 * pressureAlt;
    const densityAlt = pressureAlt + 120 * (t - isaTemp);
    return { pressureAlt, isaTemp, densityAlt };
  }, [elev, qnh, oat]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Calcula la altitud densidad a partir de elevación, QNH y temperatura
        actual del aeródromo (OAT).
      </Text>

      <FormField
        label="Elevación AD (ft)"
        value={elev}
        onChangeText={setElev}
        keyboardType="decimal-pad"
      />
      <FormField
        label="QNH (hPa)"
        value={qnh}
        onChangeText={setQnh}
        keyboardType="decimal-pad"
      />
      <FormField
        label="Temperatura OAT (°C)"
        value={oat}
        onChangeText={setOat}
        keyboardType="decimal-pad"
      />

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
        <Result label="Altitud presión" value={`${result.pressureAlt.toFixed(0)} ft`} />
        <Result label="ISA esperada" value={`${result.isaTemp.toFixed(1)} °C`} />
        <Result
          label="Altitud densidad"
          value={`${result.densityAlt.toFixed(0)} ft`}
          highlight
        />
      </View>

      <Text style={[styles.tip, { color: colors.mutedForeground }]}>
        A mayor altitud densidad, menor performance: aumentar carrera de
        despegue y revisar gradiente de ascenso publicado en el POH.
      </Text>
    </ScrollView>
  );
}

function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.resRow}>
      <Text style={[styles.resLabel, { color: colors.mutedForeground }]}>{label}</Text>
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
  note: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  results: { padding: 18, borderWidth: 1, gap: 10 },
  resRow: { flexDirection: "row", justifyContent: "space-between" },
  resLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  resValue: { fontSize: 16 },
  tip: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
});
