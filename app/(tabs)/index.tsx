import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MetarCard } from "@/components/MetarCard";
import { Tile } from "@/components/Tile";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ready, disclaimerAccepted, vencimientos, novedades } = useAppData();

  useEffect(() => {
    if (ready && !disclaimerAccepted) {
      router.push("/disclaimer");
    }
  }, [ready, disclaimerAccepted]);

  const proximosVenc = vencimientos
    .filter((v) => new Date(v.fechaVencimiento).getTime() > Date.now() - 86400000)
    .sort(
      (a, b) =>
        new Date(a.fechaVencimiento).getTime() -
        new Date(b.fechaVencimiento).getTime(),
    );
  const novedadesAbiertas = novedades.filter((n) => n.estado === "Abierta");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            AeroUtil · Cockpit
          </Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Buen día, piloto.
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Toda la información operativa, en un solo panel.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/disclaimer")}
          hitSlop={10}
          style={({ pressed }) => [
            styles.headerBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius - 4,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="info" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <MetarCard />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          PANEL DE INSTRUMENTOS
        </Text>
        <View style={styles.grid}>
          <Tile
            label="Meteorología"
            icon="cloud-drizzle"
            href="/meteorologia"
            accent={colors.accent}
          />
          <Tile
            label="Plan de vuelo"
            icon="map"
            href="/planificacion"
            accent={colors.primary}
          />
        </View>
        <View style={styles.grid}>
          <Tile
            label="Tráfico en vivo"
            icon="radio"
            href="/trafico"
            accent="#34D399"
          />
          <Tile
            label="Aeródromos"
            icon="map-pin"
            href="/aeropuertos"
            accent="#FBBF24"
          />
        </View>
        <View style={styles.grid}>
          <Tile
            label="Mi aeroclub"
            icon="users"
            href="/aeroclub"
            accent="#A78BFA"
          />
          <Tile
            label="Biblioteca"
            icon="book-open"
            href="/biblioteca"
            accent="#F472B6"
          />
        </View>
        <View style={styles.grid}>
          <Tile
            label="Vuelos comerciales"
            icon="briefcase"
            href="/comerciales"
            accent="#60A5FA"
          />
          <Tile
            label="Directorio operativo"
            icon="phone"
            href="/directorio"
            accent="#FB923C"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          ESTADO RÁPIDO
        </Text>
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <StatusItem
            icon="calendar"
            label="Próximos vencimientos"
            value={proximosVenc.length.toString()}
            tint={
              proximosVenc.length > 0 ? colors.warning : colors.mutedForeground
            }
            onPress={() => router.push("/aeroclub")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatusItem
            icon="tool"
            label="Novedades técnicas abiertas"
            value={novedadesAbiertas.length.toString()}
            tint={
              novedadesAbiertas.length > 0
                ? colors.destructive
                : colors.mutedForeground
            }
            onPress={() => router.push("/aeroclub")}
          />
        </View>
      </View>

      <Pressable
        onPress={() =>
          WebBrowser.openBrowserAsync("https://ais.anac.gob.ar/aip")
        }
        style={({ pressed }) => [
          styles.disclaimer,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            borderRadius: colors.radius - 4,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="shield" size={14} color={colors.primary} />
        <Text
          style={[styles.disclaimerText, { color: colors.mutedForeground }]}
        >
          Verifique siempre la información en fuentes oficiales (EANA / ANAC /
          SMN). AeroUtil centraliza enlaces, no reemplaza la documentación
          oficial.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function StatusItem({
  icon,
  label,
  value,
  tint,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  tint: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statusItem,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          { backgroundColor: tint + "1F", borderRadius: 999 },
        ]}
      >
        <Feather name={icon} size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statusLabel, { color: colors.foreground }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.statusValue, { color: tint }]}>{value}</Text>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    gap: 12,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 4,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
    gap: 12,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  grid: { flexDirection: "row", gap: 12 },
  statusCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  statusIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  statusValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  divider: { height: 1 },
  disclaimer: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
  },
  disclaimerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
