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
import type { ApiAerodromo } from "@/lib/types";

export default function MiAerodromoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status, hasActiveSubscription, token, user } = useAuth();
  const isAerodromo = user?.role === "aerodromo";

  const [mine, setMine] = useState<ApiAerodromo | null>(null);
  const [list, setList] = useState<ApiAerodromo[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [nombre, setNombre] = useState("");
  const [icao, setIcao] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pista, setPista] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [contacto, setContacto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (isAerodromo) {
        const a = await api.aerodromoMine(token);
        setMine(a);
        if (a) {
          setNombre(a.nombre ?? "");
          setIcao(a.icao ?? "");
          setProvincia(a.provincia ?? "");
          setCiudad(a.ciudad ?? "");
          setPista(a.pista ?? "");
          setFrecuencia(a.frecuencia ?? "");
          setContacto(a.contacto ?? "");
          setDescripcion(a.descripcion ?? "");
        }
      } else {
        const all = await api.aerodromosList(token);
        setList(all);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        Alert.alert("No se pudo cargar", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token, isAerodromo]);

  useEffect(() => {
    if (status === "authenticated" && hasActiveSubscription) refresh();
  }, [status, hasActiveSubscription, refresh]);

  const save = async () => {
    if (!token) return;
    if (!nombre.trim()) {
      Alert.alert("Datos incompletos", "Completá al menos el nombre.");
      return;
    }
    setBusy(true);
    try {
      const updated = await api.aerodromoUpsert(token, {
        nombre: nombre.trim(),
        icao: icao.trim().toUpperCase() || undefined,
        provincia: provincia.trim() || undefined,
        ciudad: ciudad.trim() || undefined,
        pista: pista.trim() || undefined,
        frecuencia: frecuencia.trim() || undefined,
        contacto: contacto.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
      });
      setMine(updated);
      Alert.alert("Guardado", "La información del aeródromo fue actualizada.");
    } catch (err) {
      Alert.alert(
        "No se pudo guardar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  if (status !== "authenticated" || !hasActiveSubscription) {
    return (
      <Paywall
        reason="Mi Aeródromo está disponible con la suscripción mensual de la red. Iniciá sesión para gestionar la información de tu aeródromo o consultar la red de aeródromos."
        ctaLabel="Mi Aeródromo"
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
        title="Mi Aeródromo"
        subtitle={
          isAerodromo
            ? "Información pública de tu aeródromo"
            : "Aeródromos asociados a la red"
        }
        showBack
      />

      {isAerodromo ? (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Datos generales
            </Text>
            <FormField label="Nombre" value={nombre} onChangeText={setNombre} />
            <FormField
              label="ICAO"
              value={icao}
              onChangeText={(t) => setIcao(t.toUpperCase())}
              placeholder="SAXX"
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Provincia"
                  value={provincia}
                  onChangeText={setProvincia}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Ciudad"
                  value={ciudad}
                  onChangeText={setCiudad}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Pista"
                  value={pista}
                  onChangeText={setPista}
                  placeholder="800m / asfalto"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Frecuencia"
                  value={frecuencia}
                  onChangeText={setFrecuencia}
                  placeholder="123.45"
                />
              </View>
            </View>
            <FormField
              label="Contacto"
              value={contacto}
              onChangeText={setContacto}
              placeholder="Teléfono o email"
            />
            <FormField
              label="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Servicios, horarios, frecuencias…"
              multiline
              numberOfLines={4}
            />
            <PrimaryButton
              label={mine ? "Actualizar aeródromo" : "Crear mi aeródromo"}
              icon="save"
              full
              loading={busy}
              onPress={save}
            />
          </View>

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
            <Feather name="image" size={16} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.foreground }]}>
              Subir fotos a la comunidad
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {loading && list.length === 0 ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              Cargando…
            </Text>
          ) : list.length === 0 ? (
            <EmptyState
              icon="map-pin"
              title="Sin aeródromos publicados"
              description="Cuando los aeródromos completen su perfil aparecerán acá."
            />
          ) : (
            list.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.aerodromoCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={styles.aRow}>
                  <Text style={[styles.aTitle, { color: colors.foreground }]}>
                    {a.nombre}
                  </Text>
                  {a.icao ? (
                    <Text style={[styles.aIcao, { color: colors.primary }]}>
                      {a.icao}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.aSub, { color: colors.mutedForeground }]}>
                  {[a.ciudad, a.provincia].filter(Boolean).join(" · ")}
                </Text>
                {a.pista ? (
                  <Text style={[styles.aMeta, { color: colors.foreground }]}>
                    Pista: {a.pista}
                  </Text>
                ) : null}
                {a.frecuencia ? (
                  <Text style={[styles.aMeta, { color: colors.foreground }]}>
                    Frecuencia: {a.frecuencia}
                  </Text>
                ) : null}
                {a.contacto ? (
                  <Text
                    style={[styles.aMeta, { color: colors.mutedForeground }]}
                  >
                    Contacto: {a.contacto}
                  </Text>
                ) : null}
                {a.descripcion ? (
                  <Text
                    style={[styles.aDesc, { color: colors.mutedForeground }]}
                  >
                    {a.descripcion}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  muted: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    paddingHorizontal: 4,
  },
  aerodromoCard: { padding: 14, borderWidth: 1, gap: 6 },
  aRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  aIcao: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.6,
  },
  aSub: { fontFamily: "Inter_500Medium", fontSize: 12 },
  aMeta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  aDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
  },
  linkText: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
