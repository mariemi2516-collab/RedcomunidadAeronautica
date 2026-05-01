import { Feather } from "@expo/vector-icons";
  import { router } from "expo-router";
  import * as Linking from "expo-linking";
  import * as WebBrowser from "expo-web-browser";
  import React, { useEffect, useMemo } from "react";
  import {
    Image,
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
  import { dashboardAd } from "@/lib/ads";

  function getArgentinaGreeting(): string {
    const now = new Date();
    const arHour = (now.getUTCHours() - 3 + 24) % 24;
    if (arHour >= 5 && arHour < 12) return "Buen día";
    if (arHour >= 12 && arHour < 20) return "Buenas tardes";
    return "Buenas noches";
  }

  export default function DashboardScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { ready, disclaimerAccepted, vencimientos, novedades } = useAppData();

    useEffect(() => {
      if (ready && !disclaimerAccepted) router.push("/disclaimer");
    }, [ready, disclaimerAccepted]);

    const greeting = useMemo(() => getArgentinaGreeting(), []);

    const proximosVenc = vencimientos
      .filter((v) => new Date(v.fechaVencimiento).getTime() > Date.now() - 86400000)
      .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
    const novedadesAbiertas = novedades.filter((n) => n.estado === "Abierta");

    const openAd = () => {
      if (!dashboardAd.enabled) return;
      if (dashboardAd.link.type === "whatsapp") {
        const phone = dashboardAd.link.phone.replace(/[^\d]/g, "");
        const msg = encodeURIComponent(dashboardAd.link.message ?? "");
        Linking.openURL(`https://wa.me/${phone}${msg ? `?text=${msg}` : ""}`).catch(() => {});
      } else {
        WebBrowser.openBrowserAsync(dashboardAd.link.href).catch(() => {});
      }
    };

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>AeroUtil · Cockpit</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{greeting}.</Text>
          </View>
          <Pressable onPress={() => router.push("/disclaimer")} hitSlop={10}
            style={({ pressed }) => [styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4, opacity: pressed ? 0.7 : 1 }]}>
            <Feather name="info" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Pressable onPress={openAd} disabled={!dashboardAd.enabled}
            style={({ pressed }) => [styles.adSlot, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius - 2, opacity: pressed && dashboardAd.enabled ? 0.85 : 1 }]}>
            {dashboardAd.enabled && dashboardAd.image ? (
              <Image source={dashboardAd.image} resizeMode="cover" style={styles.adImage} accessibilityLabel={dashboardAd.title ?? "Anuncio"} />
            ) : (
              <View style={styles.adPlaceholder}>
                <Feather name="image" size={22} color={colors.mutedForeground} />
                <Text style={[styles.adPlaceholderText, { color: colors.mutedForeground }]}>Espacio publicitario disponible</Text>
              </View>
            )}
            {dashboardAd.enabled && (dashboardAd.title || dashboardAd.subtitle) ? (
              <View style={styles.adCaption}>
                {dashboardAd.title ? <Text style={[styles.adTitle, { color: colors.foreground }]}>{dashboardAd.title}</Text> : null}
                {dashboardAd.subtitle ? <Text style={[styles.adSubtitle, { color: colors.mutedForeground }]}>{dashboardAd.subtitle}</Text> : null}
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.section}>
          <MetarCard />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PANEL DE INSTRUMENTOS</Text>
          <View style={styles.grid}>
            <Tile label="Meteorología" icon="cloud-drizzle" href="/meteorologia" accent={colors.accent} />
            <Tile label="Plan de vuelo" icon="map" href="/planificacion" accent={colors.primary} />
          </View>
          <View style={styles.grid}>
            <Tile label="Tráfico en vivo" icon="radio" href="/trafico" accent="#34D399" />
            <Tile label="Aeródromos" icon="map-pin" href="/aeropuertos" accent="#FBBF24" />
          </View>
          <View style={styles.grid}>
            <Tile label="Mi aeroclub" icon="users" href="/aeroclub-paywall" accent="#A78BFA" />
            <Tile label="Biblioteca" icon="book-open" href="/biblioteca" accent="#F472B6" />
          </View>
          <View style={styles.grid}>
            <Tile label="Vuelos comerciales" icon="briefcase" href="/comerciales" accent="#60A5FA" />
            <Tile label="Directorio/Servicios" icon="phone" href="/directorio" accent="#FB923C" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ESTADO RÁPIDO</Text>
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <StatusItem icon="calendar" label="Próximos vencimientos" value={proximosVenc.length.toString()}
              tint={proximosVenc.length > 0 ? colors.warning : colors.mutedForeground} onPress={() => router.push("/aeroclub-paywall")} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatusItem icon="tool" label="Novedades técnicas abiertas" value={novedadesAbiertas.length.toString()}
              tint={novedadesAbiertas.length > 0 ? colors.destructive : colors.mutedForeground} onPress={() => router.push("/aeroclub-paywall")} />
          </View>
        </View>

        <Pressable onPress={() => WebBrowser.openBrowserAsync("https://ais.anac.gob.ar/aip")}
          style={({ pressed }) => [styles.disclaimer, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius - 4, opacity: pressed ? 0.85 : 1 }]}>
          <Feather name="shield" size={14} color={colors.primary} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Verifique siempre la información en fuentes oficiales (EANA / ANAC / SMN). AeroUtil centraliza enlaces, no reemplaza la documentación oficial.
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  function StatusItem({ icon, label, value, tint, onPress }: {
    icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string; tint: string; onPress: () => void;
  }) {
    const colors = useColors();
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.statusItem, { opacity: pressed ? 0.7 : 1 }]}>
        <View style={[styles.statusIcon, { backgroundColor: tint + "1F", borderRadius: 999 }]}>
          <Feather name={icon} size={16} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: colors.foreground }]}>{label}</Text>
        </View>
        <Text style={[styles.statusValue, { color: tint }]}>{value}</Text>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>
    );
  }

  const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, gap: 12 },
    eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
    greeting: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 4, letterSpacing: -0.4 },
    headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    adSlot: { borderWidth: 1, overflow: "hidden", minHeight: 96 },
    adImage: { width: "100%", height: 120 },
    adPlaceholder: { height: 96, alignItems: "center", justifyContent: "center", gap: 6 },
    adPlaceholderText: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.5 },
    adCaption: { paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
    adTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
    adSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12 },
    section: { paddingHorizontal: 20, marginTop: 22, gap: 12 },
    sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
    grid: { flexDirection: "row", gap: 12 },
    statusCard: { borderWidth: 1, overflow: "hidden" },
    statusItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    statusIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    statusLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
    statusValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
    divider: { height: 1 },
    disclaimer: { marginTop: 24, marginHorizontal: 20, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1 },
    disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, flex: 1 },
  });
  