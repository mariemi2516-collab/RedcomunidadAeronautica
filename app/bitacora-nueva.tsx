import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";
import type { BitacoraEntry } from "@/lib/types";

function parseDurationMinutes(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;

  if (/^\d{1,2}:\d{2}$/.test(normalized)) {
    const [hours, minutes] = normalized.split(":").map(Number);
    if (minutes >= 60) return null;
    return hours * 60 + minutes;
  }

  const hours = Number(normalized);
  if (!Number.isFinite(hours) || hours <= 0) return null;

  return Math.round(hours * 60);
}

const TIPO_OPTIONS: BitacoraEntry["tipoVuelo"][] = [
  "Local",
  "Traves\u00eda",
  "Instrucci\u00f3n",
  "Trabajo a\u00e9reo",
];

export default function BitacoraNuevaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBitacora } = useAppData();

  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [matricula, setMatricula] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [duracion, setDuracion] = useState("");
  const [tipoVuelo, setTipoVuelo] =
    useState<BitacoraEntry["tipoVuelo"]>("Local");
  const [observaciones, setObservaciones] = useState("");

  const save = async () => {
    const matriculaValue = matricula.trim().toUpperCase();
    const origenValue = origen.trim().toUpperCase();
    const destinoValue = (destino.trim() || origenValue).toUpperCase();
    const duracionMin = parseDurationMinutes(duracion);

    if (!matriculaValue || !origenValue || !duracionMin) {
      Alert.alert(
        "Datos incompletos",
        "Completa la matricula, origen y duracion del vuelo.",
      );
      return;
    }

    await addBitacora({
      fecha,
      matricula: matriculaValue,
      origen: origenValue,
      destino: destinoValue,
      duracionMin,
      tipoVuelo,
      observaciones: observaciones.trim() || undefined,
    });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: insets.bottom + 40,
        gap: 14,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Nuevo registro
      </Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Los datos quedan guardados en tu dispositivo. Ley 25.326.
      </Text>

      <FormField
        label="Fecha"
        value={fecha}
        onChangeText={setFecha}
        placeholder="AAAA-MM-DD"
      />

      <FormField
        label="Matricula"
        value={matricula}
        onChangeText={(t) => setMatricula(t.toUpperCase())}
        placeholder="LV-XXX"
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FormField
            label="Origen (ICAO)"
            value={origen}
            onChangeText={(t) => setOrigen(t.toUpperCase())}
            placeholder="SADF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField
            label="Destino (ICAO)"
            value={destino}
            onChangeText={(t) => setDestino(t.toUpperCase())}
            placeholder="SAEZ"
            hint="Si lo dejas vacio, se usa el mismo origen."
          />
        </View>
      </View>

      <FormField
        label="Duracion"
        value={duracion}
        onChangeText={setDuracion}
        keyboardType="decimal-pad"
        placeholder="1.5 o 01:30"
        hint="Acepta horas decimales o formato HH:MM."
      />

      <View>
        <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>
          TIPO DE VUELO
        </Text>
        <View style={styles.chipRow}>
          {TIPO_OPTIONS.map((option) => (
            <Text
              key={option}
              onPress={() => setTipoVuelo(option)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    tipoVuelo === option ? colors.primary : colors.secondary,
                  color:
                    tipoVuelo === option
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              {option}
            </Text>
          ))}
        </View>
      </View>

      <FormField
        label="Observaciones"
        value={observaciones}
        onChangeText={setObservaciones}
        placeholder="Briefing, condiciones, lecciones aprendidas..."
        multiline
        numberOfLines={4}
      />

      <PrimaryButton label="Guardar vuelo" icon="check" onPress={save} full />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 6,
  },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    overflow: "hidden",
  },
});
