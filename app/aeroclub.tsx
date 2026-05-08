import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, api } from "@/lib/api";
import type { ApiVencimiento } from "@/lib/types";

const TIPOS: ApiVencimiento["tipo"][] = [
  "CMA",
  "Licencia",
  "Seguro",
  "Habilitacion",
  "Otro",
];

export default function MisVencimientosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status, hasActiveSubscription, token } = useAuth();

  const [items, setItems] = useState<ApiVencimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<ApiVencimiento["tipo"]>("CMA");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.vencimientosList(token);
      setItems(
        data
          .slice()
          .sort(
            (a, b) =>
              new Date(a.fechaVencimiento).getTime() -
              new Date(b.fechaVencimiento).getTime(),
          ),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        Alert.alert("No se pudieron cargar los vencimientos", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated" && hasActiveSubscription) refresh();
  }, [status, hasActiveSubscription, refresh]);

  const create = async () => {
    if (!token) return;
    if (!titulo.trim() || !fecha.trim()) {
      Alert.alert("Datos incompletos", "Completá título y fecha de vencimiento.");
      return;
    }
    setBusy(true);
    try {
      const created = await api.vencimientoCreate(token, {
        titulo: titulo.trim(),
        tipo,
        fechaVencimiento: fecha.trim(),
        notas: notas.trim() || undefined,
      });
      setItems((prev) =>
        [created, ...prev].sort(
          (a, b) =>
            new Date(a.fechaVencimiento).getTime() -
            new Date(b.fechaVencimiento).getTime(),
        ),
      );
      setTitulo("");
      setFecha("");
      setNotas("");
    } catch (err) {
      Alert.alert(
        "No se pudo crear",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await api.vencimientoRemove(token, id);
      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      Alert.alert(
        "No se pudo eliminar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    }
  };

  if (status !== "authenticated" || !hasActiveSubscription) {
    return (
      <Paywall
        reason="Necesitás iniciar sesión y suscripción activa para ver tus vencimientos."
        ctaLabel="Mis Vencimientos"
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 80,
        paddingTop: insets.top + 4,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader
        title="Mis Vencimientos"
        subtitle="CMA · Licencias · Seguros · Habilitaciones"
        showBack
      />

      <View style={{ paddingHorizontal: 20, gap: 14 }}>
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
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            Nuevo vencimiento
          </Text>
          <FormField
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ej. CMA Clase 2"
          />
          <View>
            <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>
              TIPO
            </Text>
            <View style={styles.chipRow}>
              {TIPOS.map((t) => {
                const active = tipo === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTipo(t)}
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
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <FormField
            label="Fecha"
            value={fecha}
            onChangeText={setFecha}
            placeholder="AAAA-MM-DD"
          />
          <FormField
            label="Notas (opcional)"
            value={notas}
            onChangeText={setNotas}
            placeholder="Detalle, lugar de trámite, etc."
            multiline
            numberOfLines={2}
          />
          <PrimaryButton
            label="Agregar vencimiento"
            icon="plus"
            full
            loading={busy}
            onPress={create}
          />
        </View>

        {loading && items.length === 0 ? (
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Cargando…
          </Text>
        ) : items.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Sin vencimientos cargados"
            description="Cargá CMA, licencias, seguros y habilitaciones para recibir alertas visuales."
          />
        ) : (
          items.map((v) => {
            const days = Math.round(
              (new Date(v.fechaVencimiento).getTime() - Date.now()) / 86400000,
            );
            const tint =
              days < 0
                ? colors.destructive
                : days <= 30
                  ? colors.warning
                  : colors.success;
            return (
              <View
                key={v.id}
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius - 2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.itemDot,
                    { backgroundColor: tint, borderRadius: 4 },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.itemTitle, { color: colors.foreground }]}
                  >
                    {v.titulo}
                  </Text>
                  <Text
                    style={[
                      styles.itemSub,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {v.tipo} · {v.fechaVencimiento}
                  </Text>
                  {v.notas ? (
                    <Text
                      style={[styles.notes, { color: colors.mutedForeground }]}
                    >
                      {v.notas}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.daysText, { color: tint }]}>
                  {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
                </Text>
                <Pressable
                  onPress={() => remove(v.id)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            );
          })
        )}

        <Pressable
          onPress={() => router.push("/comunidad")}
          style={({ pressed }) => [
            styles.linkRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: colors.radius - 4,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="message-square" size={16} color={colors.primary} />
          <Text style={[styles.linkText, { color: colors.foreground }]}>
            Ver la comunidad aeronáutica
          </Text>
          <Feather
            name="chevron-right"
            size={16}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formCard: { padding: 16, borderWidth: 1, gap: 12 },
  formTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  itemDot: { width: 4, height: 30 },
  itemTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  itemSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  notes: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  daysText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  iconBtn: { padding: 6 },
  muted: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    paddingHorizontal: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  linkText: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
