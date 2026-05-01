import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card, StatPill } from "@/components/Section";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";
import type { BitacoraEntry } from "@/lib/types";

function formatHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function VuelosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bitacora, totalHorasMin, removeBitacora } = useAppData();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList<BitacoraEntry>
        data={bitacora}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: 20,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                BITÁCORA DIGITAL
              </Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Vuelos
              </Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                Tu libro de vuelo personal con respaldo local.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <StatPill
                label="Vuelos"
                value={bitacora.length.toString()}
                tint={colors.accent}
              />
              <StatPill
                label="Horas totales"
                value={formatHM(totalHorasMin)}
                tint={colors.primary}
              />
              <StatPill
                label="Promedio"
                value={
                  bitacora.length > 0
                    ? formatHM(Math.round(totalHorasMin / bitacora.length))
                    : "00:00"
                }
                tint={colors.success}
              />
            </View>

            <PrimaryButton
              label="Registrar vuelo"
              icon="plus"
              onPress={() => router.push("/bitacora-nueva")}
              full
            />

            <Card>
              <View style={styles.fplRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fplTitle, { color: colors.foreground }]}>
                    Plan de vuelo electrónico
                  </Text>
                  <Text
                    style={[styles.fplDesc, { color: colors.mutedForeground }]}
                  >
                    Presentación oficial vía EANA.
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    WebBrowser.openBrowserAsync("https://www.eana.com.ar/servicios")
                  }
                  style={({ pressed }) => [
                    styles.fplBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: colors.radius - 4,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.fplBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Abrir
                  </Text>
                  <Feather
                    name="external-link"
                    size={14}
                    color={colors.primaryForeground}
                  />
                </Pressable>
              </View>
            </Card>

            {bitacora.length > 0 ? (
              <Text
                style={[styles.listLabel, { color: colors.mutedForeground }]}
              >
                HISTORIAL
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="navigation"
            title="Sin vuelos registrados"
            description="Registrá tu primer vuelo para comenzar tu bitácora digital."
          />
        }
        renderItem={({ item }) => <BitacoraRow item={item} onRemove={removeBitacora} />}
      />
    </View>
  );
}

function BitacoraRow({
  item,
  onRemove,
}: {
  item: BitacoraEntry;
  onRemove: (id: string) => Promise<void>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        rowStyles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={rowStyles.headerRow}>
        <View
          style={[
            rowStyles.tag,
            { backgroundColor: colors.accent + "1F", borderRadius: 6 },
          ]}
        >
          <Text style={[rowStyles.tagText, { color: colors.accent }]}>
            {item.tipoVuelo}
          </Text>
        </View>
        <Text style={[rowStyles.fecha, { color: colors.mutedForeground }]}>
          {item.fecha}
        </Text>
      </View>

      <Text style={[rowStyles.route, { color: colors.foreground }]}>
        {item.origen.toUpperCase()} → {item.destino.toUpperCase()}
      </Text>

      <View style={rowStyles.metaRow}>
        <Text style={[rowStyles.meta, { color: colors.mutedForeground }]}>
          {item.matricula.toUpperCase()}
        </Text>
        <Text style={[rowStyles.meta, { color: colors.primary }]}>
          {formatHM(item.duracionMin)}
        </Text>
      </View>

      {item.observaciones ? (
        <Text style={[rowStyles.obs, { color: colors.mutedForeground }]}>
          {item.observaciones}
        </Text>
      ) : null}

      <Pressable
        onPress={() => onRemove(item.id)}
        style={({ pressed }) => [
          rowStyles.deleteBtn,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
        <Text
          style={[rowStyles.deleteText, { color: colors.mutedForeground }]}
        >
          Eliminar
        </Text>
      </Pressable>
    </View>
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
  statsRow: { flexDirection: "row", gap: 10 },
  fplRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  fplTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  fplDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  fplBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fplBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  listLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
    marginTop: 4,
  },
});

const rowStyles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  tag: { paddingHorizontal: 8, paddingVertical: 3 },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fecha: {
    marginLeft: "auto",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  route: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  obs: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    fontStyle: "italic",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingTop: 4,
  },
  deleteText: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
