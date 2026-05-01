import React, { useMemo, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import { useColors } from "@/hooks/useColors";

export default function CombustibleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [consumo, setConsumo] = useState("28");
  const [tiempo, setTiempo] = useState("1.5");
  const [reserva, setReserva] = useState("0.75");
  const [precio, setPrecio] = useState("");

  const result = useMemo(() => {
    const c = Number(consumo) || 0;
    const t = Number(tiempo) || 0;
    const r = Number(reserva) || 0;
    const totalLts = c * (t + r);
    const tripLts = c * t;
    const reservaLts = c * r;
    const cost = precio.trim() ? totalLts * Number(precio) : null;
    return { totalLts, tripLts, reservaLts, cost };
  }, [consumo, tiempo, reserva, precio]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 160, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Estimación de combustible y costo. Verificá consumo real con el POH y
            condiciones de vuelo.
          </Text>

          <FormField
            label="Consumo (lts/h)"
            value={consumo}
            onChangeText={setConsumo}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Tiempo de vuelo (h)"
            value={tiempo}
            onChangeText={setTiempo}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Reserva legal (h)"
            value={reserva}
            onChangeText={setReserva}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Precio AVGAS (ARS/lt) — opcional"
            value={precio}
            onChangeText={setPrecio}
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
            <Result label="Tramo" value={`${result.tripLts.toFixed(1)} lts`} />
            <Result label="Reserva" value={`${result.reservaLts.toFixed(1)} lts`} />
            <Result
              label="Total a cargar"
              value={`${result.totalLts.toFixed(1)} lts`}
              highlight
            />
            {result.cost != null ? (
              <Result
                label="Costo estimado"
                value={`$ ${result.cost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
              />
            ) : null}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
});
