import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type FormCard = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
};

const FORMS: FormCard[] = [
  {
    id: "fpl",
    title: "Plan de Vuelo (FPL)",
    subtitle: "Formulario ICAO editable",
    badge: "Editable",
    route: "/fpl-form",
  },
  {
    id: "alfa",
    title: "Formulario Alfa",
    subtitle: "Declaración del piloto / aeronave",
    badge: "Editable",
    route: "/alfa-form",
  },
];

export default function FormsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, gap: 18 }}
    >
      <View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          FORMULARIOS
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Documentos de vuelo
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Completá, descargá y compartí los formularios necesarios para tu vuelo.
        </Text>
      </View>

      {FORMS.map((f) => (
        <Pressable
          key={f.id}
          onPress={() => Linking.openURL(`aero://${f.route}`).catch(() => {})}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconCircle}>
              <Feather name="file-text" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {f.title}
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                {f.subtitle}
              </Text>
            </View>
            {f.badge && (
              <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {f.badge}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.arrow}>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 4, letterSpacing: -0.4 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  card: { borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  cardContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 },
  arrow: { paddingLeft: 4 },
});
