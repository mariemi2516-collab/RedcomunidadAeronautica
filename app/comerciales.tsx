import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
  import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinkRow } from "@/components/LinkRow";
import { useColors } from "@/hooks/useColors";
import { comercialesLinks } from "@/lib/links";

const AIRPORTS = [
  {
    icao: "SAEZ",
    iata: "EZE",
    name: "Ezeiza — Ministro Pistarini",
    twr: "118.10",
    lat: -34.8222,
    lon: -58.5358,
    wifi: "AA2000_WiFi",
  },
  {
    icao: "SABE",
    iata: "AEP",
    name: "Aeroparque — Jorge Newbery",
    twr: "118.30",
    lat: -34.5592,
    lon: -58.4156,
    wifi: "AA2000_WiFi",
  },
  {
    icao: "SACO",
    iata: "COR",
    name: "Córdoba — Pajas Blancas",
    twr: "118.10",
    lat: -31.3236,
    lon: -64.2079,
    wifi: "AA2000_WiFi",
  },
  {
    icao: "SAZN",
    iata: "NQN",
    name: "Neuquén — Presidente Perón",
    twr: "118.30",
    lat: -38.949,
    lon: -68.155,
    wifi: "AA2000_WiFi",
  },
  {
    icao: "SAZS",
    iata: "BRC",
    name: "Bariloche — Teniente Candelaria",
    twr: "118.10",
    lat: -41.151,
    lon: -71.158,
    wifi: "AA2000_WiFi",
  },
];

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ComercialesScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
  const [nearest, setNearest] = useState<typeof AIRPORTS[number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectAirport = async () => {
    setLoading(true);
    setError(null);
    try {
      let lat: number;
      let lon: number;
      if (Platform.OS === "web") {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          }),
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permiso de ubicación denegado");
          setLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      }
      let best = AIRPORTS[0];
      let bestDist = distanceKm(lat, lon, best.lat, best.lon);
      for (const ap of AIRPORTS.slice(1)) {
        const d = distanceKm(lat, lon, ap.lat, ap.lon);
        if (d < bestDist) {
          best = ap;
          bestDist = d;
        }
      }
      setNearest(best);
    } catch (e) {
      setError("No se pudo obtener la ubicación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 120,
          gap: 18,
        }}
    >
      <View
        style={[
          styles.airportMode,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <View style={styles.modeHeader}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: colors.primary + "26" },
            ]}
          >
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modeTitle, { color: colors.foreground }]}>
              Modo Aeropuerto
            </Text>
            <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>
              Detecta tu posición y muestra info de la terminal más cercana.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={detectAirport}
          disabled={loading}
          style={({ pressed }) => [
            styles.modeBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 4,
              opacity: loading ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="navigation" size={16} color={colors.primaryForeground} />
          <Text style={[styles.modeBtnText, { color: colors.primaryForeground }]}>
            {loading ? "Detectando..." : "Detectar aeropuerto cercano"}
          </Text>
        </Pressable>

        {error ? (
          <Text style={[styles.error, { color: colors.warning }]}>{error}</Text>
        ) : null}

        {nearest ? (
          <View style={styles.nearestBlock}>
            <Text style={[styles.nearestIcao, { color: colors.primary }]}>
              {nearest.icao} · {nearest.iata}
            </Text>
            <Text style={[styles.nearestName, { color: colors.foreground }]}>
              {nearest.name}
            </Text>
            <View style={styles.detailGrid}>
              <Detail label="TWR" value={nearest.twr} />
              <Detail label="WiFi" value={nearest.wifi} />
            </View>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          AEROPUERTOS DISPONIBLES
        </Text>
        {AIRPORTS.map((a) => (
          <View
            key={a.icao}
            style={[
              styles.apRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius - 2,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.apName, { color: colors.foreground }]}>
                {a.name}
              </Text>
              <Text style={[styles.apMeta, { color: colors.mutedForeground }]}>
                {a.icao} · {a.iata} · TWR {a.twr}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {comercialesLinks.map((sec) => (
        <View key={sec.title} style={{ gap: 10 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {sec.title.toUpperCase()}
          </Text>
          {sec.items.map((item) => (
            <LinkRow key={item.id} {...item} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.detail,
        { borderColor: colors.border, borderRadius: 8 },
      ]}
    >
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  airportMode: {
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  modeHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  modeDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  modeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  nearestBlock: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    gap: 6,
  },
  nearestIcao: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  nearestName: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  detailGrid: { flexDirection: "row", gap: 8, marginTop: 8 },
  detail: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  detailLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1,
  },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  apRow: {
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  apName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  apMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3 },
});
