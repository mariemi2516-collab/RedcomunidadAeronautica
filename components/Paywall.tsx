import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

export function Paywall({
  reason,
  ctaLabel,
}: {
  reason: string;
  ctaLabel?: string;
}) {
  const colors = useColors();
  const {
    status,
    user,
    subscription,
    hasActiveSubscription,
    config,
    login,
    register,
    activateSubscription,
    logout,
    refreshSubscription,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"piloto" | "aerodromo">("piloto");
  const [busy, setBusy] = useState(false);

  const priceUsd = config?.subscription.priceUsd ?? 4;

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Datos incompletos", "Completá email y contraseña.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      Alert.alert("Datos incompletos", "Indicá tu nombre.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim().toLowerCase(), password);
      } else {
        await register({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          role,
        });
      }
      setPassword("");
    } catch (err) {
      Alert.alert(
        mode === "login" ? "No se pudo iniciar sesión" : "No se pudo crear la cuenta",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  const activate = async () => {
    setBusy(true);
    try {
      await activateSubscription();
      Alert.alert("Suscripción activa", "Acceso premium habilitado por 30 días.");
      router.back();
    } catch (err) {
      Alert.alert(
        "No se pudo activar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader title="Red de Comunidad Aeronáutica" subtitle="Acceso premium" />

      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={styles.head}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: colors.primary + "26" },
            ]}
          >
            <Feather name="lock" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              ACCESO PREMIUM
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {ctaLabel ?? "Suscripción mensual"}
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {reason}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.priceCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
            PLAN MENSUAL
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceValue, { color: colors.foreground }]}>
              USD {priceUsd}
            </Text>
            <Text style={[styles.pricePer, { color: colors.mutedForeground }]}>
              /mes
            </Text>
          </View>
          <Text style={[styles.priceDesc, { color: colors.mutedForeground }]}>
            Mi Aeródromo · Mis Vencimientos · Vuelos con seguimiento de horas y
            costos. Acceso a la comunidad para subir fotos y novedades.
          </Text>
        </View>

        {status === "authenticated" && user ? (
          hasActiveSubscription ? (
            <View
              style={[
                styles.activeCard,
                { borderColor: colors.success, backgroundColor: colors.success + "1A" },
              ]}
            >
              <Feather name="check-circle" size={18} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.activeTitle, { color: colors.success }]}>
                  Suscripción activa
                </Text>
                {subscription?.expiresAt ? (
                  <Text style={[styles.activeSub, { color: colors.mutedForeground }]}>
                    Vence: {new Date(subscription.expiresAt).toLocaleDateString("es-AR")}
                  </Text>
                ) : null}
              </View>
              <PrimaryButton
                label="Volver"
                icon="arrow-right"
                onPress={() => router.back()}
              />
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Hola, {user.name}
              </Text>
              <Text style={[styles.helper, { color: colors.mutedForeground }]}>
                Tu cuenta está creada pero la suscripción está inactiva. Activala para
                acceder a Mi Aeródromo, Mis Vencimientos y Vuelos.
              </Text>
              <PrimaryButton
                label={`Activar suscripción · USD ${priceUsd}/mes`}
                icon="credit-card"
                full
                loading={busy}
                onPress={activate}
              />
              <Pressable
                onPress={async () => {
                  await refreshSubscription();
                }}
                hitSlop={8}
                style={{ alignSelf: "flex-start" }}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Refrescar estado
                </Text>
              </Pressable>
              <Pressable onPress={logout} hitSlop={8} style={{ alignSelf: "flex-start" }}>
                <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                  Cerrar sesión
                </Text>
              </Pressable>
            </View>
          )
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <View style={[styles.tabRow, { borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
              {(["login", "register"] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={({ pressed }) => [
                      styles.tab,
                      {
                        backgroundColor: active ? colors.primary : "transparent",
                        borderRadius: colors.radius - 6,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color: active
                            ? colors.primaryForeground
                            : colors.mutedForeground,
                        },
                      ]}
                    >
                      {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === "register" ? (
              <>
                <FormField
                  label="Nombre"
                  value={name}
                  onChangeText={setName}
                  placeholder="Cómo te llamás"
                  autoCapitalize="words"
                />
                <View>
                  <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>
                    SOY
                  </Text>
                  <View style={styles.chipRow}>
                    {(["piloto", "aerodromo"] as const).map((r) => {
                      const active = role === r;
                      return (
                        <Pressable
                          key={r}
                          onPress={() => setRole(r)}
                          style={({ pressed }) => [
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.secondary,
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
                            {r === "piloto" ? "Piloto / alumno" : "Aeródromo"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : null}
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
            />
            <PrimaryButton
              label={mode === "login" ? "Ingresar" : "Crear cuenta"}
              icon={mode === "login" ? "log-in" : "user-plus"}
              full
              loading={busy}
              onPress={submit}
            />
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Tu cuenta se asocia al backend de la red. Podés probar con los usuarios
              de demostración (ver README del backend).
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 2 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginTop: 4 },
  priceCard: { padding: 16, borderWidth: 1, gap: 4 },
  priceLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  priceValue: { fontFamily: "Inter_700Bold", fontSize: 36, letterSpacing: -0.4 },
  pricePer: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 6 },
  priceDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginTop: 6 },
  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  tabRow: { flexDirection: "row", padding: 4, borderWidth: 1, gap: 4 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  activeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  activeTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  activeSub: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
});
