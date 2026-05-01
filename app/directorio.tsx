import { Feather } from "@expo/vector-icons";
  import * as Linking from "expo-linking";
  import React, { useState } from "react";
  import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
  } from "react-native";
  import { useSafeAreaInsets } from "react-native-safe-area-context";

  import { useColors } from "@/hooks/useColors";
  import {
    type DirectorioCategoria,
    directorioCategorias,
    directorioItems,
  } from "@/lib/links";

  export default function DirectorioScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [active, setActive] = useState<DirectorioCategoria>("combustibles");
    const items = directorioItems[active];

    const callOrOpen = (raw: string) => {
      if (/^https?:\/\//i.test(raw) || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
        Linking.openURL(raw).catch(() => {});
        return;
      }
      const t = raw.replace(/[^\d+]/g, "");
      if (t.length > 4) Linking.openURL(`tel:${t}`).catch(() => {});
    };

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catsRow}
        >
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
                    borderRadius: 999,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    {
                      color: isActive ? colors.primaryForeground : colors.foreground,
                    },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: insets.bottom + 40,
            gap: 10,
          }}
        >
          {items.map((it) => (
            <View
              key={it.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {it.nombre}
                </Text>
                <Text style={[styles.location, { color: colors.mutedForeground }]}>
                  {it.ubicacion}
                </Text>
                <Text
                  style={[styles.contact, { color: colors.accent }]}
                  onPress={() => callOrOpen(it.telUrl || it.contacto)}
                >
                  {it.contacto}
                </Text>
              </View>
              <Pressable
                onPress={() => callOrOpen(it.telUrl || it.contacto)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.callBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: colors.radius - 4,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather
                  name={it.telUrl?.startsWith("http") ? "external-link" : "phone"}
                  size={16}
                  color={colors.primaryForeground}
                />
              </Pressable>
            </View>
          ))}
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Confirmá disponibilidad y precios con el proveedor antes de
            desplazarte. AeroAR no provee servicios; solo facilita el contacto.
          </Text>
        </ScrollView>
      </View>
    );
  }

  const styles = StyleSheet.create({
    catsRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
    cat: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    catText: { fontFamily: "Inter_600SemiBold", fontSize: 12, includeFontPadding: false, textAlignVertical: "center" },
    row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderWidth: 1 },
    name: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
    location: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
    contact: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 },
    callBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    note: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, marginTop: 6, textAlign: "center" },
  });
  