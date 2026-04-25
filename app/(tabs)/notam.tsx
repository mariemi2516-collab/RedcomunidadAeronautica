import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinkRow } from "@/components/LinkRow";
import { useColors } from "@/hooks/useColors";

const NOTAM_SOURCES = [
  {
    id: "ifis-notam",
    title: "IFIS — NOTAM Argentina",
    subtitle: "Consulta oficial integrada (EANA)",
    url: "https://ais.anac.gob.ar/notam/",
    badge: "Oficial",
  },
  {
    id: "faa-notam",
    title: "FAA NOTAM Search",
    subtitle: "Búsqueda internacional por ICAO",
    url: "https://notams.aim.faa.gov/notamSearch/",
  },
];

export default function NotamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [icao, setIcao] = useState("");

  const buscarPorICAO = () => {
    const code = icao.trim().toUpperCase();
    if (code.length < 3) return;
    WebBrowser.openBrowserAsync(
      `https://notams.aim.faa.gov/notamSearch/nsapp.html#/results;designators=${code}`,
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 110,
        paddingHorizontal: 20,
        gap: 18,
      }}
    >
      <View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          AVISOS A NAVEGANTES
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>NOTAM</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Información operacional de aeródromos, espacios y servicios.
        </Text>
      </View>

      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.searchLabel, { color: colors.mutedForeground }]}>
          BUSCAR POR ICAO
        </Text>
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
            value={icao}
            onChangeText={(t) => setIcao(t.toUpperCase().slice(0, 4))}
            autoCapitalize="characters"
            placeholder="Ej. SAEZ, SABE, SAZN"
            placeholderTextColor={colors.mutedForeground}
            onSubmitEditing={buscarPorICAO}
            returnKeyType="search"
            style={[styles.input, { color: colors.foreground }]}
          />
          <Pressable
            onPress={buscarPorICAO}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius - 6,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
              Buscar
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Abre la búsqueda de NOTAM en el navegador externo.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          FUENTES OFICIALES
        </Text>
        {NOTAM_SOURCES.map((src) => (
          <LinkRow key={src.id} {...src} />
        ))}
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="info" size={16} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Los NOTAM cambian con frecuencia. Verificá siempre la versión vigente
          antes de cada vuelo en las fuentes oficiales (EANA / IFIS).
        </Text>
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
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 4,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  searchCard: { padding: 16, borderWidth: 1, gap: 10 },
  searchLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 8,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    letterSpacing: 1.2,
  },
  cta: {
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  infoCard: {
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
});
