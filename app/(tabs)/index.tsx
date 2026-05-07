import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
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

import { AppHeader } from "@/components/AppHeader";
import { MetarCard } from "@/components/MetarCard";
import { Tile } from "@/components/Tile";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dashboardAd } from "@/lib/ads";

function getArgentinaGreeting(): string {
  const now = new Date();
  const arHour = (now.getUTCHours() - 3 + 24) % 24;
  if (arHour >= 5 && arHour < 12) return "Buen día";
  if (arHour >= 12 && arHour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const shopItems = [
  {
    id: "headset",
    name: "Headset ANR",
    price: "$ 185.000",
    detail: "Comunicación",
    image:
      "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "kneeboard",
    name: "Rodillera VFR",
    price: "$ 38.500",
    detail: "Planificación",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "flashlight",
    name: "Linterna táctica",
    price: "$ 42.900",
    detail: "Cabina",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "documents",
    name: "Porta documentos",
    price: "$ 24.900",
    detail: "Organización",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ready, disclaimerAccepted } = useAppData();
  const { user, hasActiveSubscription, status, logout } = useAuth();

  useEffect(() => {
    if (ready && !disclaimerAccepted) router.push("/disclaimer");
  }, [ready, disclaimerAccepted]);

  const greeting = useMemo(() => getArgentinaGreeting(), []);

  const openAd = () => {
    if (!dashboardAd.enabled) return;
    if (dashboardAd.link.type === "whatsapp") {
      const phone = dashboardAd.link.phone.replace(/[^\d]/g, "");
      const msg = encodeURIComponent(dashboardAd.link.message ?? "");
      Linking.openURL(`https://wa.me/${phone}${msg ? `?text=${msg}` : ""}`).catch(
        () => {},
      );
    } else {
      WebBrowser.openBrowserAsync(dashboardAd.link.href).catch(() => {});
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 160,
      }}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title="Red de Comunidad Aeronáutica"
        subtitle={greeting}
        right={
          <Pressable
            onPress={() => router.push("/disclaimer")}
            hitSlop={12}
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
        }
      />

      <View style={[styles.welcomeBlock]}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          {user ? `${greeting}, ${user.name.split(" ")[0]}.` : `${greeting}.`}
        </Text>
        <Pressable
          onPress={() => router.push("/ajustes")}
          hitSlop={6}
          style={({ pressed }) => [
            styles.settingsLink,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 999,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="settings" size={12} color={colors.foreground} />
          <Text style={[styles.settingsText, { color: colors.foreground }]}>
            Ajustes
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <Pressable
          onPress={openAd}
          disabled={!dashboardAd.enabled}
          style={({ pressed }) => [
            styles.adSlot,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: colors.radius - 2,
              opacity: pressed && dashboardAd.enabled ? 0.85 : 1,
            },
          ]}
        >
          {dashboardAd.enabled && dashboardAd.image ? (
            <Image
              source={dashboardAd.image}
              resizeMode="cover"
              style={styles.adImage}
              accessibilityLabel={dashboardAd.title ?? "Anuncio"}
            />
          ) : (
            <View style={styles.adPlaceholder}>
              <Feather name="image" size={22} color={colors.mutedForeground} />
              <Text
                style={[
                  styles.adPlaceholderText,
                  { color: colors.mutedForeground },
                ]}
              >
                Espacio publicitario disponible
              </Text>
            </View>
          )}
          {dashboardAd.enabled && (dashboardAd.title || dashboardAd.subtitle) ? (
            <View style={styles.adCaption}>
              {dashboardAd.title ? (
                <Text style={[styles.adTitle, { color: colors.foreground }]}>
                  {dashboardAd.title}
                </Text>
              ) : null}
              {dashboardAd.subtitle ? (
                <Text
                  style={[styles.adSubtitle, { color: colors.mutedForeground }]}
                >
                  {dashboardAd.subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
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
            label="Biblioteca"
            icon="book-open"
            href="/biblioteca"
            accent="#F472B6"
          />
          <Tile
            label="NOTAM"
            icon="alert-triangle"
            href="/notam"
            accent="#F87171"
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
            label="Directorio"
            icon="phone"
            href="/directorio"
            accent="#FB923C"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          MI CUENTA · ACCESO PREMIUM
        </Text>
        <View style={styles.grid}>
          <Tile
            label="Mi aeródromo"
            icon="home"
            href={
              status === "authenticated" && hasActiveSubscription
                ? "/mi-aerodromo"
                : "/aeroclub-paywall"
            }
            accent="#A78BFA"
          />
          <Tile
            label="Mis vencimientos"
            icon="calendar"
            href={
              status === "authenticated" && hasActiveSubscription
                ? "/aeroclub"
                : "/aeroclub-paywall"
            }
            accent="#FBBF24"
          />
        </View>
        <View style={styles.grid}>
          <Tile
            label="Vuelos (curso)"
            icon="navigation"
            href="/(tabs)/vuelos"
            accent="#34D399"
          />
          <Tile
            label="Comunidad"
            icon="users"
            href="/(tabs)/comunidad"
            accent="#60A5FA"
          />
        </View>
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
          <Feather
            name={hasActiveSubscription ? "check-circle" : "lock"}
            size={18}
            color={hasActiveSubscription ? colors.success : colors.warning}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>
              {hasActiveSubscription
                ? "Suscripción activa"
                : status === "authenticated"
                  ? "Suscripción inactiva"
                  : "Sin sesión"}
            </Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
              {hasActiveSubscription
                ? "Tenés acceso a Mi Aeródromo, Mis Vencimientos y Vuelos."
                : status === "authenticated"
                  ? "Activá la suscripción mensual de USD 4 para desbloquear todo."
                  : "Iniciá sesión y activá la suscripción mensual de USD 4."}
            </Text>
          </View>
          {status === "authenticated" ? (
            <Pressable
              onPress={logout}
              hitSlop={6}
              style={({ pressed }) => [
                styles.outBtn,
                {
                  borderColor: colors.border,
                  borderRadius: 999,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather
                name="log-out"
                size={12}
                color={colors.mutedForeground}
              />
              <Text style={[styles.outText, { color: colors.mutedForeground }]}>
                Salir
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push("/aeroclub-paywall")}
              hitSlop={6}
              style={({ pressed }) => [
                styles.outBtn,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                  borderRadius: 999,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather
                name="log-in"
                size={12}
                color={colors.primaryForeground}
              />
              <Text style={[styles.outText, { color: colors.primaryForeground }]}>
                Ingresar
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TIENDA ONLINE
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeList}
        >
          {shopItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.productCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <Image
                source={{ uri: item.image }}
                resizeMode="cover"
                style={styles.productImage}
              />
              <View style={styles.productBody}>
                <Text
                  style={[styles.productName, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.productDetail,
                    { color: colors.mutedForeground },
                  ]}
                  numberOfLines={1}
                >
                  {item.detail}
                </Text>
                <Text style={[styles.productPrice, { color: colors.primary }]}>
                  {item.price}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
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
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          Verificá siempre la información en fuentes oficiales (EANA / ANAC /
          SMN). Red de Comunidad Aeronáutica centraliza enlaces, no reemplaza la
          documentación oficial.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  welcomeBlock: {
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  settingsLink: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  settingsText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  adSlot: { borderWidth: 1, overflow: "hidden", minHeight: 96 },
  adImage: { width: "100%", height: 120 },
  adPlaceholder: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adPlaceholderText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  adCaption: { paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  adTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  adSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12 },
  section: { paddingHorizontal: 20, marginTop: 22, gap: 12 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  grid: { flexDirection: "row", gap: 12 },
  storeList: { gap: 12, paddingRight: 20 },
  productCard: { width: 146, borderWidth: 1, overflow: "hidden" },
  productImage: { width: "100%", height: 92, backgroundColor: "#E5E7EB" },
  productBody: { padding: 10, gap: 4, minHeight: 104 },
  productName: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17 },
  productDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 14,
  },
  productPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    lineHeight: 18,
    marginTop: 2,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  statusTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  statusSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  outBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  outText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
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
