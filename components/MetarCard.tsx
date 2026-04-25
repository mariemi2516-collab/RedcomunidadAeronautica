import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type MetarState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; raw: string; observed: string }
  | { status: "error"; message: string };

const ICAO_DEFAULT = "SAEZ";

async function fetchMetar(icao: string): Promise<{ raw: string; observed: string }> {
  const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(
    icao,
  )}&format=json&taf=false&hours=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = (await res.json()) as Array<{
    rawOb?: string;
    receiptTime?: string;
    obsTime?: number;
  }>;
  if (!data || data.length === 0) throw new Error("Sin datos");
  const m = data[0];
  return {
    raw: m.rawOb ?? "",
    observed: m.receiptTime ?? "",
  };
}

export function MetarCard() {
  const colors = useColors();
  const [icao, setIcao] = useState(ICAO_DEFAULT);
  const [pending, setPending] = useState(ICAO_DEFAULT);
  const [state, setState] = useState<MetarState>({ status: "idle" });

  const load = useCallback(async (code: string) => {
    setState({ status: "loading" });
    try {
      const { raw, observed } = await fetchMetar(code);
      if (!raw) {
        setState({ status: "error", message: "Sin reporte para " + code });
      } else {
        setState({ status: "ok", raw, observed });
      }
    } catch (e) {
      setState({
        status: "error",
        message: "No se pudo obtener el METAR. Verifique conectividad.",
      });
    }
  }, []);

  useEffect(() => {
    load(icao);
  }, [icao, load]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            METAR EN VIVO
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {icao.toUpperCase()}
          </Text>
        </View>
        <Pressable
          onPress={() => load(icao)}
          style={({ pressed }) => [
            styles.refresh,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius - 4,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="refresh-cw" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: colors.radius - 4,
          },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={pending}
          onChangeText={(t) => setPending(t.toUpperCase().slice(0, 4))}
          autoCapitalize="characters"
          placeholder="ICAO (ej. SAEZ)"
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => {
            if (pending.length >= 3) setIcao(pending);
          }}
          returnKeyType="search"
          style={[styles.input, { color: colors.foreground }]}
        />
        <Pressable
          onPress={() => pending.length >= 3 && setIcao(pending)}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 6,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
            Buscar
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {state.status === "loading" ? (
          <ActivityIndicator color={colors.primary} />
        ) : state.status === "ok" ? (
          <>
            <Text
              selectable
              style={[styles.metarText, { color: colors.foreground }]}
            >
              {state.raw}
            </Text>
            {state.observed ? (
              <Text style={[styles.observed, { color: colors.mutedForeground }]}>
                Observado: {state.observed} UTC
              </Text>
            ) : null}
          </>
        ) : state.status === "error" ? (
          <Text style={[styles.error, { color: colors.warning }]}>
            {state.message}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() =>
          WebBrowser.openBrowserAsync("https://www.smn.gob.ar/aeronautica")
        }
        style={({ pressed }) => [
          styles.footerLink,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.footerText, { color: colors.accent }]}>
          Abrir SMN Aeronáutica
        </Text>
        <Feather name="external-link" size={14} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  titleBlock: { flex: 1 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 2,
  },
  refresh: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 8,
    height: 44,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 1.2,
  },
  cta: {
    paddingHorizontal: 12,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  body: { minHeight: 60, justifyContent: "center" },
  metarText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  observed: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 6,
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  footerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
