import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import {
  type DirectorioCategoria,
  directorioCategorias,
  directorioItems,
} from "@/lib/links";

export default function DirectorioScreen() {
  const colors = useColors();
  const [active, setActive] = useState<DirectorioCategoria>("combustible");
  const items = directorioItems[active];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 8 }}>
        {directorioCategorias.map((c) => {
          const isActive = c.id === active;
          return (
            <Pressable
              key={c.id}
              onPress={() => setActive(c.id)}
              style={({ pressed }) => [
                styles.cat,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderRadius: 14,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.catText, { color: isActive ? colors.primaryForeground : colors.foreground }]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 10 }}>
        {items.map((it) => (
          <View key={it.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{it.nombre}</Text>
              <Text style={[styles.location, { color: colors.mutedForeground }]}>{it.ubicacion}</Text>
              <Text style={[styles.contact, { color: colors.accent }]} onPress={() => { const t = it.contacto.replace(/[^\d+]/g, ""); if (t.length > 4) Linking.openURL(`tel:${t}`); }}>
                {it.contacto}
              </Text>
            </View>
            <Pressable
              onPress={() => { const t = it.contacto.replace(/[^\d+]/g, ""); if (t.length > 4) Linking.openURL(`tel:${t}`); }}
              hitSlop={10}
              style={({ pressed }) => [styles.callBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4, opacity: pressed ? 0.85 : 1 }]}
            >
              <Feather name="phone" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>
        ))}
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Confirmá disponibilidad y precios con el proveedor antes de desplazarte. AeroAR no provee servicios; solo facilita el contacto.
         main
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cat: {
 arreglar links
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  catText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderWidth: 1,
    height: 36,
    alignSelf: "flex-start",
 main
    alignItems: "center",
    justifyContent: "center",
  },
  catText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderWidth: 1 },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  location: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  contact: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 },
  callBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  note: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: 6, textAlign: "center" },
});
