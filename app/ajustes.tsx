import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, api, getApiBaseUrl, setApiBaseUrlCache } from "@/lib/api";
import { STORAGE_KEYS, loadJSON, saveJSON } from "@/lib/storage";

export default function AjustesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, status, hasActiveSubscription, subscription, logout, refreshConfig } =
    useAuth();

  const [baseUrl, setBaseUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadJSON<string>(STORAGE_KEYS.apiBaseUrl, "");
      const effective = stored || (await getApiBaseUrl());
      setBaseUrl(effective);
    })();
  }, []);

  const save = async () => {
    const trimmed = baseUrl.trim().replace(/\/$/, "");
    if (!trimmed) {
      Alert.alert("URL vacía", "Indicá la URL del backend.");
      return;
    }
    setBusy(true);
    try {
      await saveJSON(STORAGE_KEYS.apiBaseUrl, trimmed);
      setApiBaseUrlCache(trimmed);
      const health = await api.health();
      if (!health.ok) throw new Error("Respuesta inválida");
      await refreshConfig();
      Alert.alert("Conectado", "El backend responde correctamente.");
    } catch (err) {
      Alert.alert(
        "No se pudo conectar",
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 80,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader title="Ajustes" subtitle="Conexión al backend y sesión" showBack />

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
            URL del backend
          </Text>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            Por defecto la app usa el backend local. Para usar otro servidor,
            ingresá la URL completa, ej: https://api.miempresa.com
          </Text>
          <FormField
            label="URL"
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="http://localhost:4000"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <PrimaryButton
            label="Guardar y verificar"
            icon="check"
            full
            loading={busy}
            onPress={save}
          />
        </View>

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
            Mi cuenta
          </Text>
          {status === "authenticated" && user ? (
            <>
              <Row label="Email" value={user.email} />
              <Row
                label="Rol"
                value={user.role === "aerodromo" ? "Aeródromo" : "Piloto"}
              />
              <Row
                label="Suscripción"
                value={
                  hasActiveSubscription
                    ? subscription?.expiresAt
                      ? `Activa hasta ${new Date(subscription.expiresAt).toLocaleDateString("es-AR")}`
                      : "Activa"
                    : "Inactiva"
                }
              />
              <Pressable
                onPress={async () => {
                  await logout();
                  Alert.alert("Sesión cerrada");
                }}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.outBtn,
                  {
                    borderColor: colors.border,
                    borderRadius: colors.radius - 4,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name="log-out"
                  size={14}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.outText, { color: colors.mutedForeground }]}
                >
                  Cerrar sesión
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              No iniciaste sesión. Ingresá desde el botón &quot;Acceso premium&quot;
              del dashboard.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, gap: 10 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  rowValue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  outBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  outText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
