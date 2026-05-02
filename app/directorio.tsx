import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { aerodromos } from "@/data/aerodromos";
import { useColors } from "@/hooks/useColors";
import {
  type DirectorioCategoria,
  directorioCategorias,
  directorioItems,
} from "@/lib/links";

type TabId = DirectorioCategoria | "combustible-calc" | "todos-aeropuertos";

const TABS: { id: TabId; label: string }[] = [
  ...directorioCategorias.map((c) => ({ id: c.id, label: c.label })),
  { id: "todos-aeropuertos", label: "Aeropuertos" },
  { id: "combustible-calc", label: "Combustible" },
];

const MIN_TAP = 44;

export default function DirectorioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<TabId>("combustibles");
  const items = active !== "combustible-calc" && active !== "todos-aeropuertos"
    ? directorioItems[active]
    : [];

  const callOrOpen = (raw: string) => {
    if (/^https?:\/\//i.test(raw) || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
      Linking.openURL(raw).catch(() => {});
      return;
    }
    const t = raw.replace(/[^\d+]/g, "");
    if (t.length > 4) Linking.openURL(`tel:${t}`).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catsRow}
      >
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <Pressable
              key={t.id}
              onPress={() => setActive(t.id)}
              style={({ pressed }) => [
                styles.cat,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderWidth: 1,
                  minHeight: MIN_TAP,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  {
                    color: isActive ? colors.primaryForeground : colors.foreground,
                  },
                ]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {active === "combustible-calc" ? (
        <FuelCalculator />
      ) : active === "todos-aeropuertos" ? (
        <AllAirports callOrOpen={callOrOpen} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 160,
            gap: 12,
          }}
        >
          {items.map((it) => (
            <View
              key={it.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {it.nombre}
                </Text>
                <Text style={[styles.location, { color: colors.mutedForeground }]}>
                  {it.ubicacion}
                </Text>
                <Pressable
                  onPress={() => callOrOpen(it.telUrl || it.contacto)}
                  style={styles.contactArea}
                >
                  <Text style={[styles.contact, { color: colors.accent }]}>
                    {it.contacto}
                  </Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => callOrOpen(it.telUrl || it.contacto)}
                style={({ pressed }) => [
                  styles.callBtn,
                  {
                    backgroundColor: colors.primary,
                    minWidth: MIN_TAP,
                    minHeight: MIN_TAP,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather
                  name={it.telUrl?.startsWith("http") ? "external-link" : "phone"}
                  size={18}
                  color={colors.primaryForeground}
                />
              </Pressable>
            </View>
          ))}
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Confirmá disponibilidad y precios con el proveedor antes de
            desplazarte. AeroAR no provee servicios; solo facilita el contacto.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

function FuelCalculator() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [distance, setDistance] = useState("");
  const [consumo, setConsumo] = useState("");
  const [tiempoTaxi, setTiempoTaxi] = useState("10");
  const [reserva, setReserva] = useState("45");
  const [speed, setSpeed] = useState("120");

  const dist = parseFloat(distance) || 0;
  const cons = parseFloat(consumo) || 0;
  const taxi = parseFloat(tiempoTaxi) || 0;
  const res = parseFloat(reserva) || 0;
  const spd = parseFloat(speed) || 120;

  const tiempoVuelo = spd > 0 ? (dist / spd) * 60 : 0;
  const tiempoTotal = tiempoVuelo + taxi + res;
  const combustibleTotal = cons > 0 ? (tiempoTotal / 60) * cons : 0;
  const combustibleVuelo = cons > 0 ? (tiempoVuelo / 60) * cons : 0;
  const combustibleTaxi = cons > 0 ? (taxi / 60) * cons : 0;
  const combustibleReserva = cons > 0 ? (res / 60) * cons : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 160,
            gap: 10,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.calcCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.calcTitle, { color: colors.foreground }]}>
              Calculadora de Combustible
            </Text>
            <Text style={[styles.calcSub, { color: colors.mutedForeground }]}>
              Estimación para vuelo VFR diurno
            </Text>

            <InputRow label="Distancia (NM)" value={distance} onChangeText={setDistance} keyboardType="numeric" colors={colors} />
            <InputRow label="Velocidad crucero (kt)" value={speed} onChangeText={setSpeed} keyboardType="numeric" colors={colors} />
            <InputRow label="Consumo (GPH o LPH)" value={consumo} onChangeText={setConsumo} keyboardType="numeric" colors={colors} />
            <InputRow label="Taxi (min)" value={tiempoTaxi} onChangeText={setTiempoTaxi} keyboardType="numeric" colors={colors} />
            <InputRow label="Reserva (min)" value={reserva} onChangeText={setReserva} keyboardType="numeric" colors={colors} />

            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <Text style={[styles.resultTitle, { color: colors.primary }]}>
                RESULTADO
              </Text>
              <ResultRow label="Tiempo de vuelo" value={`${tiempoVuelo.toFixed(0)} min`} colors={colors} />
              <ResultRow label="Taxi" value={`${combustibleTaxi.toFixed(1)}`} colors={colors} />
              <ResultRow label="Vuelo" value={`${combustibleVuelo.toFixed(1)}`} colors={colors} />
              <ResultRow label="Reserva" value={`${combustibleReserva.toFixed(1)}`} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ResultRow label="TOTAL" value={`${combustibleTotal.toFixed(1)} gal/L`} colors={colors} bold />
            </View>

            <Text style={[styles.note, { color: colors.mutedForeground }]}>
              Esta es una estimación. Siempre verificá con el POH de tu aeronave y
              considerá factores como viento, altitud y temperatura.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  keyboardType,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "numeric";
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        placeholder="0"
        placeholderTextColor={colors.mutedForeground + "90"}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: colors.radius - 4,
            color: colors.foreground,
            minHeight: MIN_TAP,
          },
        ]}
      />
    </View>
  );
}

function ResultRow({
  label,
  value,
  colors,
  bold,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  bold?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.resultValue,
          { color: colors.foreground },
          bold && { fontWeight: "700", color: colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function AllAirports({ callOrOpen }: { callOrOpen: (raw: string) => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filtered = aerodromos.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.icao.toLowerCase().includes(q) ||
      a.nombre.toLowerCase().includes(q) ||
      a.ciudad.toLowerCase().includes(q) ||
      (a.iata && a.iata.toLowerCase().includes(q))
    );
  });

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: insets.bottom + 160,
        gap: 12,
      }}
    >
      <View
        style={[
          styles.searchRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            minHeight: MIN_TAP,
          },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar aeródromo..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
      </View>

      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {filtered.length} aeródromos
      </Text>

      {filtered.map((a) => (
        <View
          key={a.icao + a.ciudad}
          style={[
            styles.row,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {a.icao} {a.iata ? `(${a.iata})` : ""}
            </Text>
            <Text style={[styles.location, { color: colors.mutedForeground }]}>
              {a.nombre}
            </Text>
            <Text style={[styles.contact, { color: colors.accent }]}>
              {a.ciudad}, {a.provincia} · Elev {a.elevacionFt} ft
              {a.twr ? ` · TWR ${a.twr}` : ""}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  catsRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  cat: { paddingHorizontal: 16, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderRadius: 999 },
  catText: { fontFamily: "Inter_600SemiBold", fontSize: 12, includeFontPadding: false, textAlignVertical: "center" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, gap: 12 },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  location: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3 },
  contact: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 },
  contactArea: { paddingVertical: 4, paddingEnd: 4 },
  callBtn: { alignItems: "center", justifyContent: "center", borderRadius: 999 },
  note: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 20, textAlign: "center", paddingHorizontal: 8 },
  calcCard: { padding: 18, borderWidth: 1, gap: 16 },
  calcTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  calcSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: -10 },
  inputLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.5 },
  input: { paddingHorizontal: 14, fontFamily: "Inter_500Medium", fontSize: 15, borderWidth: 1 },
  resultCard: { padding: 16, borderWidth: 1, gap: 10, marginTop: 6 },
  resultTitle: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 1.5 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  resultLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  resultValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  divider: { height: 1, marginVertical: 6 },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15 },
  count: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: -4 },
});
