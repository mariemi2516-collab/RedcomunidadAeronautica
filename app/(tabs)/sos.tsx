import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";

const SAR_NUMBER = "+5491148522900";
const SAR_LABEL = "SAR - Servicio de Busqueda y Salvamento";

export default function SosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sosContacts, addSosContact, removeSosContact, pilot } = useAppData();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sending, setSending] = useState(false);

  const formatMessage = async () => {
    let coords = "Ubicacion no disponible";

    if (Platform.OS === "web") {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        });
        coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      } catch {}
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        }
      } catch {}
    }

    const piloto = pilot.nombre || "Piloto AeroUtil";
    const matricula = pilot.aeronavePredeterminada
      ? ` - ${pilot.aeronavePredeterminada.toUpperCase()}`
      : "";

    return `EMERGENCIA AERONAUTICA. ${piloto}${matricula} solicita asistencia. Posicion GPS: ${coords}. Hora: ${new Date().toLocaleString()}.`;
  };

  const sendSos = async (mode: "whatsapp" | "sms") => {
    if (sosContacts.length === 0) {
      Alert.alert(
        "Sin contactos",
        "Agrega al menos un contacto de emergencia antes de enviar.",
      );
      return;
    }

    setSending(true);

    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      const message = await formatMessage();
      const target = sosContacts[0]?.telefono?.replace(/[^\d+]/g, "");

      if (!target) {
        Alert.alert(
          "Contacto invalido",
          "El primer contacto no tiene un telefono valido.",
        );
        return;
      }

      const url =
        mode === "whatsapp"
          ? `https://wa.me/${target.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`
          : `sms:${target}?body=${encodeURIComponent(message)}`;

      await Linking.openURL(url);
    } catch {
      Alert.alert("No se pudo enviar", "Verifica la app de mensajeria.");
    } finally {
      setSending(false);
    }
  };

  const callSAR = () => {
    Linking.openURL(`tel:${SAR_NUMBER}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 110,
        paddingHorizontal: 20,
        gap: 18,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text style={[styles.eyebrow, { color: colors.destructive }]}>
          EMERGENCIA
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>SOS</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Comparti tu posicion y notifica a tus contactos en un toque.
        </Text>
      </View>

      <Pressable
        disabled={sending}
        onPress={() => sendSos("whatsapp")}
        style={({ pressed }) => [
          styles.sosBig,
          {
            backgroundColor: colors.destructive,
            borderRadius: colors.radius + 4,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather
          name="alert-octagon"
          size={42}
          color={colors.destructiveForeground}
        />
        <Text
          style={[styles.sosBigText, { color: colors.destructiveForeground }]}
        >
          ENVIAR SOS
        </Text>
        <Text
          style={[
            styles.sosBigDesc,
            { color: colors.destructiveForeground, opacity: 0.85 },
          ]}
        >
          WhatsApp con tu posicion GPS al primer contacto
        </Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Enviar por SMS"
            icon="message-square"
            variant="secondary"
            onPress={() => sendSos("sms")}
            full
          />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Llamar SAR"
            icon="phone-call"
            onPress={callSAR}
            full
          />
        </View>
      </View>

      <View
        style={[
          styles.sarCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="shield" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.sarTitle, { color: colors.foreground }]}>
            {SAR_LABEL}
          </Text>
          <Text style={[styles.sarDesc, { color: colors.mutedForeground }]}>
            Centro Coordinador SAR - {SAR_NUMBER}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          CONTACTOS DE EMERGENCIA
        </Text>

        {sosContacts.length === 0 ? (
          <EmptyState
            icon="users"
            title="Sin contactos cargados"
            description="Agrega familiares, instructores o responsables de aeroclub."
          />
        ) : (
          sosContacts.map((c) => (
            <View
              key={c.id}
              style={[
                styles.contactRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.primary + "26", borderRadius: 999 },
                ]}
              >
                <Feather name="user" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>
                  {c.nombre}
                </Text>
                <Text
                  style={[styles.contactPhone, { color: colors.mutedForeground }]}
                >
                  {c.telefono}
                </Text>
              </View>
              <Pressable
                onPress={() => Linking.openURL(`tel:${c.telefono}`)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="phone" size={16} color={colors.success} />
              </Pressable>
              <Pressable
                onPress={() => removeSosContact(c.id)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))
        )}

        <View
          style={[
            styles.addCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <FormField
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Instructor"
          />
          <FormField
            label="Telefono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholder="+54 9 11 ..."
          />
          <PrimaryButton
            label="Agregar contacto"
            icon="user-plus"
            onPress={async () => {
              if (!nombre.trim() || !telefono.trim()) return;
              await addSosContact({
                nombre: nombre.trim(),
                telefono: telefono.trim(),
              });
              setNombre("");
              setTelefono("");
            }}
            full
          />
        </View>
      </View>
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
    lineHeight: 19,
  },
  sosBig: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 6,
  },
  sosBigText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: 2,
  },
  sosBigDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  actionsRow: { flexDirection: "row", gap: 10 },
  sarCard: {
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  sarTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sarDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  contactPhone: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  iconBtn: { padding: 6 },
  addCard: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 6,
  },
});
