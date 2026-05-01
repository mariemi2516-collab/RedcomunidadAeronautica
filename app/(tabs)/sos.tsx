import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
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
      Alert.alert("Sin contactos", "Agrega al menos un contacto de emergencia.");
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
        Alert.alert("Contacto invalido", "El primer contacto no tiene telefono valido.");
        return;
      }

      if (mode === "whatsapp") {
        const url = `whatsapp://send?phone=${target.replace(/^\+/, "")}&text=${encodeURIComponent(message)}`;

        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          const smsUrl = `sms:${target}?body=${encodeURIComponent(message)}`;
          await Linking.openURL(smsUrl);
        }
      } else {
        const smsUrl = `sms:${target}?body=${encodeURIComponent(message)}`;
        await Linking.openURL(smsUrl);
      }
    } catch {
      Alert.alert("Error", "No se pudo enviar el SOS.");
    } finally {
      setSending(false);
    }
  };

  const callSAR = () => {
    Linking.openURL(`tel:${SAR_NUMBER}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 160,
            paddingHorizontal: 16,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
      <View>
        <Text style={[styles.eyebrow, { color: colors.destructive }]}>
          EMERGENCIA
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>SOS</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Compartí tu posición y notificá a tus contactos.
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
        <Feather name="alert-octagon" size={42} color="#fff" />
        <Text style={styles.sosBigText}>ENVIAR SOS</Text>
        <Text style={styles.sosBigDesc}>
          WhatsApp con tu ubicación GPS
        </Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="SMS"
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

      <View>
        <Text style={styles.sectionLabel}>CONTACTOS</Text>

        {sosContacts.length === 0 ? (
          <EmptyState
            icon="users"
            title="Sin contactos"
            description="Agregá contactos de emergencia"
          />
        ) : (
          sosContacts.map((c) => (
            <View key={c.id} style={styles.contactRow}>
              <View style={styles.avatar}>
                <Feather name="user" size={16} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.nombre}</Text>
                <Text style={styles.contactPhone}>{c.telefono}</Text>
              </View>

              <Pressable onPress={() => Linking.openURL(`tel:${c.telefono}`)} hitSlop={12} style={styles.contactAction}>
                <Feather name="phone" size={18} color="green" />
              </Pressable>

              <Pressable onPress={() => removeSosContact(c.id)} hitSlop={12} style={styles.contactAction}>
                <Feather name="x" size={18} color="gray" />
              </Pressable>
            </View>
          ))
        )}

        <View style={styles.addCard}>
          <FormField label="Nombre" value={nombre} onChangeText={setNombre} />
          <FormField
            label="Telefono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <PrimaryButton
            label="Agregar"
            icon="user-plus"
            onPress={() => {
              if (!nombre || !telefono) return;
              addSosContact({ nombre, telefono });
              setNombre("");
              setTelefono("");
            }}
            full
          />
        </View>
          </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 4 },

  sosBig: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 6,
  },

  sosBigText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  sosBigDesc: { color: "#fff", fontSize: 12, opacity: 0.8 },

  actionsRow: { flexDirection: "row", gap: 10 },

  sectionLabel: { fontSize: 11, fontWeight: "600", marginBottom: 10 },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  contactAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  contactName: { fontWeight: "600" },
  contactPhone: { fontSize: 12 },

  addCard: { marginTop: 10, gap: 10 },
});