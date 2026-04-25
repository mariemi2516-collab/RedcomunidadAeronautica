import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";

export default function DisclaimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { acceptDisclaimer, disclaimerAccepted } = useAppData();

  const handleAccept = async () => {
    await acceptDisclaimer();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 120,
          gap: 18,
        }}
      >
        <View
          style={[
            styles.iconRing,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primary + "1A",
            },
          ]}
        >
          <Feather name="shield" size={28} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Aviso operativo y legal
        </Text>

        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          AeroUtil es una herramienta de consulta y centralización de enlaces a
          fuentes públicas (EANA, ANAC, SMN, JST, etc.). El usuario debe
          verificar siempre la información en las fuentes oficiales antes de
          tomar decisiones operativas.
        </Text>

        <Bullet text="No reemplaza la documentación oficial ni el briefing meteorológico previo al vuelo." />
        <Bullet text="Las calculadoras son auxiliares: confirme los resultados con el manual de vuelo del fabricante (POH/AFM)." />
        <Bullet text="El botón SOS no sustituye el ELT ni la comunicación con servicios SAR/ATC." />
        <Bullet text="Cumplimos con la Ley 25.326 de Protección de Datos Personales: tus datos se almacenan localmente en tu dispositivo." />
        <Bullet text="No utilizamos logos oficiales de ANAC ni EANA. Todas las marcas pertenecen a sus titulares." />

        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          La seguridad operacional es responsabilidad del piloto al mando.
          AeroUtil es una herramienta complementaria.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          label={disclaimerAccepted ? "Cerrar" : "Acepto y continúo"}
          icon="check"
          onPress={handleAccept}
          full
        />
      </View>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.bulletRow}>
      <View
        style={[styles.dot, { backgroundColor: colors.primary }]}
      />
      <Text style={[styles.bulletText, { color: colors.foreground }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
});
