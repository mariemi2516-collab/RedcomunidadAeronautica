import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { Paywall } from "@/components/Paywall";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatPill } from "@/components/Section";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, api } from "@/lib/api";
import type { ApiFlight, ApiFlightProgress } from "@/lib/types";

const TIPO_OPTIONS: ApiFlight["tipoVuelo"][] = [
  "Local",
  "Travesia",
  "Instruccion",
  "Trabajo aereo",
];

const TIPO_LABELS: Record<ApiFlight["tipoVuelo"], string> = {
  Local: "Local",
  Travesia: "Travesía",
  Instruccion: "Instrucción",
  "Trabajo aereo": "Trabajo aéreo",
};

function formatHM(min: number) {
  const safe = Math.max(0, Math.round(min));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatUsd(value: number) {
  return `USD ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

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

export default function VuelosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status, hasActiveSubscription, token, config } = useAuth();

  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [progress, setProgress] = useState<ApiFlightProgress | null>(null);
  const [pricePerHourInput, setPricePerHourInput] = useState("");
  const [pricingBusy, setPricingBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [matricula, setMatricula] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [duracion, setDuracion] = useState("");
  const [tipoVuelo, setTipoVuelo] =
    useState<ApiFlight["tipoVuelo"]>("Instruccion");
  const [observaciones, setObservaciones] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [list, prog] = await Promise.all([
        api.flightsList(token),
        api.flightProgress(token),
      ]);
      setFlights(
        list
          .slice()
          .sort(
            (a, b) =>
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          ),
      );
      setProgress(prog);
      setPricePerHourInput(prog.pricePerHourUsd.toString());
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        Alert.alert("No se pudieron cargar los vuelos", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated" && hasActiveSubscription) refresh();
  }, [status, hasActiveSubscription, refresh]);

  const updatePrice = async () => {
    if (!token) return;
    const value = Number(pricePerHourInput.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      Alert.alert(
        "Precio inválido",
        "Ingresá un valor numérico válido en USD.",
      );
      return;
    }
    setPricingBusy(true);
    try {
      await api.flightUpdateSettings(token, value);
      const prog = await api.flightProgress(token);
      setProgress(prog);
      setPricePerHourInput(prog.pricePerHourUsd.toString());
      Alert.alert(
        "Precio actualizado",
        `Hora de vuelo: ${formatUsd(prog.pricePerHourUsd)}`,
      );
    } catch (err) {
      Alert.alert(
        "No se pudo actualizar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setPricingBusy(false);
    }
  };

  const create = async () => {
    if (!token) return;
    const matriculaValue = matricula.trim().toUpperCase();
    const origenValue = origen.trim().toUpperCase();
    const destinoValue = (destino.trim() || origenValue).toUpperCase();
    const duracionMin = parseDurationMinutes(duracion);
    if (!matriculaValue || !origenValue || !duracionMin) {
      Alert.alert(
        "Datos incompletos",
        "Completá matrícula, origen y duración del vuelo.",
      );
      return;
    }
    setBusy(true);
    try {
      const created = await api.flightCreate(token, {
        fecha,
        matricula: matriculaValue,
        origen: origenValue,
        destino: destinoValue,
        duracionMin,
        tipoVuelo,
        observaciones: observaciones.trim() || undefined,
      });
      setFlights((prev) =>
        [created, ...prev].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        ),
      );
      const prog = await api.flightProgress(token);
      setProgress(prog);
      setMatricula("");
      setOrigen("");
      setDestino("");
      setDuracion("");
      setObservaciones("");
      setShowForm(false);
    } catch (err) {
      Alert.alert(
        "No se pudo registrar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await api.flightRemove(token, id);
      setFlights((prev) => prev.filter((f) => f.id !== id));
      const prog = await api.flightProgress(token);
      setProgress(prog);
    } catch (err) {
      Alert.alert(
        "No se pudo eliminar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    }
  };

  const stats = useMemo(() => {
    if (!progress) return null;
    return {
      requiredHours: progress.totalCourseHours,
      flownHours: progress.flownHours,
      remainingHours: progress.remainingHours,
      progressPct: Math.max(0, Math.min(100, progress.percentage)),
      totalCost: progress.totalCostUsd,
      spentCost: progress.spentCostUsd,
      remainingCost: progress.remainingCostUsd,
      pricePerHour: progress.pricePerHourUsd,
      flownMinutes: progress.flownMinutes,
    };
  }, [progress]);

  if (status !== "authenticated" || !hasActiveSubscription) {
    return (
      <Paywall
        reason="Vuelos forma parte del paquete premium. Iniciá sesión y activá la suscripción mensual para llevar tu bitácora con horas, costos y avance del curso."
        ctaLabel="Bitácora premium"
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 160,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader
        title="Vuelos"
        subtitle={
          config
            ? `Curso ${config.course.totalHours}h · USD ${config.subscription.priceUsd}/mes`
            : "Bitácora · horas · costo del curso"
        }
      />

      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        {stats ? (
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              AVANCE DEL CURSO
            </Text>
            <View style={styles.progressRow}>
              <Text
                style={[styles.progressValue, { color: colors.foreground }]}
              >
                {formatHM(stats.flownMinutes)}
              </Text>
              <Text
                style={[
                  styles.progressTotal,
                  { color: colors.mutedForeground },
                ]}
              >
                / {stats.requiredHours}h
              </Text>
              <Text style={[styles.progressPct, { color: colors.primary }]}>
                {stats.progressPct}%
              </Text>
            </View>
            <View
              style={[
                styles.barTrack,
                { backgroundColor: colors.secondary, borderRadius: 999 },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${stats.progressPct}%`,
                    borderRadius: 999,
                  },
                ]}
              />
            </View>
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Te faltan {stats.remainingHours.toFixed(1)} horas para completar
              las {stats.requiredHours} horas requeridas del curso.
            </Text>

            <View style={styles.statsRow}>
              <StatPill
                label="Hora vuelo"
                value={formatUsd(stats.pricePerHour)}
                tint={colors.primary}
              />
              <StatPill
                label="Total curso"
                value={formatUsd(stats.totalCost)}
                tint={colors.accent}
              />
              <StatPill
                label="Restante"
                value={formatUsd(stats.remainingCost)}
                tint={colors.warning}
              />
            </View>
          </View>
        ) : null}

        <View
          style={[
            styles.priceCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Precio por hora
          </Text>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            Personalizá la tarifa horaria para calcular el costo total y
            restante del curso.
          </Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <FormField
                label="USD por hora"
                value={pricePerHourInput}
                onChangeText={setPricePerHourInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
            <PrimaryButton
              label="Guardar"
              icon="save"
              loading={pricingBusy}
              onPress={updatePrice}
            />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Bitácora ({flights.length})
          </Text>
          <Pressable
            onPress={() => setShowForm((s) => !s)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.toggleBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                borderRadius: 999,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather
              name={showForm ? "x" : "plus"}
              size={14}
              color={colors.foreground}
            />
            <Text style={[styles.toggleText, { color: colors.foreground }]}>
              {showForm ? "Cerrar" : "Registrar vuelo"}
            </Text>
          </Pressable>
        </View>

        {showForm ? (
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <FormField
              label="Fecha"
              value={fecha}
              onChangeText={setFecha}
              placeholder="AAAA-MM-DD"
            />
            <FormField
              label="Matrícula"
              value={matricula}
              onChangeText={(t) => setMatricula(t.toUpperCase())}
              placeholder="LV-XXX"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Origen"
                  value={origen}
                  onChangeText={(t) => setOrigen(t.toUpperCase())}
                  placeholder="SADF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Destino"
                  value={destino}
                  onChangeText={(t) => setDestino(t.toUpperCase())}
                  placeholder="SAEZ"
                />
              </View>
            </View>
            <FormField
              label="Duración"
              value={duracion}
              onChangeText={setDuracion}
              keyboardType="decimal-pad"
              placeholder="1.5 o 01:30"
              hint="Acepta horas decimales o formato HH:MM."
            />
            <View>
              <Text
                style={[styles.smallLabel, { color: colors.mutedForeground }]}
              >
                TIPO DE VUELO
              </Text>
              <View style={styles.chipRow}>
                {TIPO_OPTIONS.map((option) => {
                  const active = tipoVuelo === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setTipoVuelo(option)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.secondary,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: active
                              ? colors.primaryForeground
                              : colors.foreground,
                          },
                        ]}
                      >
                        {TIPO_LABELS[option]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <FormField
              label="Observaciones"
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Briefing, condiciones, lecciones aprendidas…"
              multiline
              numberOfLines={3}
            />
            <PrimaryButton
              label="Guardar vuelo"
              icon="check"
              full
              loading={busy}
              onPress={create}
            />
          </View>
        ) : null}

        {loading && flights.length === 0 ? (
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            Cargando…
          </Text>
        ) : flights.length === 0 ? (
          <EmptyState
            icon="navigation"
            title="Sin vuelos registrados"
            description="Registrá tu primer vuelo para comenzar a contar horas y costos del curso."
          />
        ) : (
          flights.map((flight) => (
            <View
              key={flight.id}
              style={[
                styles.flightCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.flightHeader}>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.accent + "1F",
                      borderRadius: 6,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.accent }]}>
                    {TIPO_LABELS[flight.tipoVuelo]}
                  </Text>
                </View>
                <Text style={[styles.fecha, { color: colors.mutedForeground }]}>
                  {flight.fecha}
                </Text>
              </View>
              <Text style={[styles.route, { color: colors.foreground }]}>
                {flight.origen} → {flight.destino}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {flight.matricula}
                </Text>
                <Text style={[styles.meta, { color: colors.primary }]}>
                  {formatHM(flight.duracionMin)}
                </Text>
                <Text style={[styles.meta, { color: colors.success }]}>
                  {flight.costoUsd > 0 ? formatUsd(flight.costoUsd) : "—"}
                </Text>
              </View>
              {flight.observaciones ? (
                <Text style={[styles.obs, { color: colors.mutedForeground }]}>
                  {flight.observaciones}
                </Text>
              ) : null}
              <Pressable
                onPress={() => remove(flight.id)}
                style={({ pressed }) => [
                  styles.deleteBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather
                  name="trash-2"
                  size={14}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.deleteText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Eliminar
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  progressCard: { padding: 16, borderWidth: 1, gap: 10 },
  progressRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  progressValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    letterSpacing: -0.4,
  },
  progressTotal: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 6,
  },
  progressPct: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    marginLeft: "auto",
    marginBottom: 6,
  },
  barTrack: { height: 8, overflow: "hidden" },
  barFill: { height: 8 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  priceCard: { padding: 16, borderWidth: 1, gap: 10 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  toggleText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  formCard: { padding: 16, borderWidth: 1, gap: 10 },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  flightCard: { padding: 14, borderWidth: 1, gap: 8 },
  flightHeader: { flexDirection: "row", alignItems: "center" },
  tag: { paddingHorizontal: 8, paddingVertical: 3 },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fecha: {
    marginLeft: "auto",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  route: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: 0.5 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  meta: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  obs: { fontFamily: "Inter_400Regular", fontSize: 12, fontStyle: "italic" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingTop: 4,
  },
  deleteText: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
