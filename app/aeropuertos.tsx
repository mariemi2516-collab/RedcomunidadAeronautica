import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinkRow } from "@/components/LinkRow";
import { aerodromos, type Aerodromo } from "@/data/aerodromos";
import { useColors } from "@/hooks/useColors";
import { aeropuertosLinks } from "@/lib/links";

const MIN_TAP = 44;

export default function AeropuertosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [showLad, setShowLad] = useState(true);
  const [showLinks, setShowLinks] = useState(true);

  const filtered = aerodromos.filter((a) => {
    const q = search.toLowerCase();

    return (
      a.icao.toLowerCase().includes(q) ||
      a.nombre.toLowerCase().includes(q) ||
      a.ciudad.toLowerCase().includes(q) ||
      (a.iata && a.iata.toLowerCase().includes(q))
    );
  });

  const openInMaps = (lat: number, lon: number, name: string) => {
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lon}`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: insets.bottom + 160,
        gap: 16,
      }}
    >
      <View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          LISTA DE AERÓDROMOS
        </Text>
      </View>

      {/* LISTA LAD */}
      <View
        style={[
          styles.toggleRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            minHeight: MIN_TAP,
          },
        ]}
      >
        <Pressable
          onPress={() => setShowLad((v) => !v)}
          style={styles.toggleBtn}
        >
          <Feather
            name={showLad ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
          <Text style={[styles.toggleText, { color: colors.foreground }]}>
            LAD
          </Text>
        </Pressable>
      </View>

      {showLad && (
        <>
          <View
            style={[
              styles.searchRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                minHeight: MIN_TAP,
              },
            ]}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por ICAO, ciudad o nombre..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                style={styles.clearBtn}
              >
                <Feather
                  name="x"
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            )}
          </View>

          <View style={{ gap: 8 }}>
            {filtered.map((a: Aerodromo) => (
              <Pressable
                key={a.icao + a.ciudad}
                onPress={() => openInMaps(a.lat, a.lon, a.nombre)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius - 2,
                    minHeight: MIN_TAP,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.icao, { color: colors.primary }]}>
                    {a.icao}
                    {a.iata ? ` · ${a.iata}` : ""}
                  </Text>

                  <Text style={[styles.name, { color: colors.foreground }]}>
                    {a.nombre}
                  </Text>

                  <Text
                    style={[styles.city, { color: colors.mutedForeground }]}
                  >
                    {a.ciudad}, {a.provincia}
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    AERO
                  </Text>
                </View>
              </Pressable>
            ))}

            {filtered.length === 0 && (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                No se encontraron resultados para "{search}"
              </Text>
            )}
          </View>
        </>
      )}

      {/* ENLACES OFICIALES */}
      <View
        style={[
          styles.toggleRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            minHeight: MIN_TAP,
          },
        ]}
      >
        <Pressable
          onPress={() => setShowLinks((v) => !v)}
          style={styles.toggleBtn}
        >
          <Feather
            name={showLinks ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
          <Text style={[styles.toggleText, { color: colors.foreground }]}>
            Enlaces oficiales
          </Text>
        </Pressable>
      </View>

      {showLinks &&
        aeropuertosLinks.map((sec) => (
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

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
  },

  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },

  clearBtn: {
    padding: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 14,
  },

  rowLeft: {
    flex: 1,
    gap: 3,
  },

  icao: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1,
  },

  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  city: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },

  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
  },

  toggleRow: {
    paddingHorizontal: 14,
    borderWidth: 1,
    justifyContent: "center",
  },

  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },

  toggleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },

  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
});