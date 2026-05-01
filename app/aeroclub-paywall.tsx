import { Feather } from "@expo/vector-icons";
  import * as Clipboard from "expo-clipboard";
  import * as Linking from "expo-linking";
  import { router } from "expo-router";
  import React, { useEffect, useMemo, useState } from "react";
  import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
  } from "react-native";
  import { useSafeAreaInsets } from "react-native-safe-area-context";

  import { FormField } from "@/components/FormField";
  import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
  import { PrimaryButton } from "@/components/PrimaryButton";
  import { useColors } from "@/hooks/useColors";
  import { STORAGE_KEYS, loadJSON, saveJSON } from "@/lib/storage";
  import { subscription } from "@/lib/subscription";

  type Mode = "login" | "register";

  type AeroclubAccess = {
    unlocked: boolean;
    email: string;
    name: string;
    password: string;
    unlockedAt?: string;
  };

  const DEFAULT_ACCESS: AeroclubAccess = { unlocked: false, email: "", name: "", password: "" };

  export default function AeroclubPaywallScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [ready, setReady] = useState(false);
    const [mode, setMode] = useState<Mode>("login");
    const [stored, setStored] = useState<AeroclubAccess>(DEFAULT_ACCESS);
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [passInput, setPassInput] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
      (async () => {
        const data = await loadJSON<AeroclubAccess>(STORAGE_KEYS.aeroclubAccess, DEFAULT_ACCESS);
        setStored(data);
        setEmailInput(data.email);
        setNameInput(data.name);
        setMode(data.email ? "login" : "register");
        setReady(true);
        if (data.unlocked) router.replace("/aeroclub");
      })();
    }, []);

    const cbuConfigured = subscription.cbu.trim().length > 0;

    const priceLine = useMemo(() => {
      const m = subscription.monthlyPriceArs;
      const y = subscription.yearlyPriceArs;
      if (m && y) return `$${m.toLocaleString("es-AR")}/mes · $${y.toLocaleString("es-AR")}/año`;
      if (m) return `$${m.toLocaleString("es-AR")} por mes`;
      if (y) return `$${y.toLocaleString("es-AR")} por año`;
      return "Consultá el valor con el administrador";
    }, []);

    const copy = async (label: string, value: string) => {
      if (!value) return;
      await Clipboard.setStringAsync(value);
      Alert.alert("Copiado", `${label} copiado al portapapeles.`);
    };

    const openWhatsApp = () => {
      const phone = subscription.whatsappPhone?.replace(/[^\d]/g, "") ?? "";
      if (!phone) { Alert.alert("WhatsApp no configurado", "Configurá el contacto en lib/subscription.ts."); return; }
      const msg = encodeURIComponent(subscription.whatsappMessage ?? "");
      Linking.openURL(`https://wa.me/${phone}${msg ? `?text=${msg}` : ""}`).catch(() => {});
    };

    const submit = async () => {
      if (!emailInput.trim() || !passInput.trim()) { Alert.alert("Datos incompletos", "Completá email y contraseña."); return; }
      setBusy(true);
      try {
        if (mode === "register") {
          if (!nameInput.trim()) { Alert.alert("Datos incompletos", "Indicá tu nombre."); setBusy(false); return; }
          const next: AeroclubAccess = { unlocked: false, email: emailInput.trim().toLowerCase(), name: nameInput.trim(), password: passInput };
          await saveJSON(STORAGE_KEYS.aeroclubAccess, next);
          setStored(next);
          setMode("login");
          Alert.alert("Cuenta creada", "Completá el pago de la suscripción y luego iniciá sesión.");
        } else {
          if (!stored.email || stored.email !== emailInput.trim().toLowerCase() || stored.password !== passInput) {
            Alert.alert("No se pudo ingresar", "Email o contraseña incorrectos.");
            setBusy(false); return;
          }
          const next: AeroclubAccess = { ...stored, unlocked: true, unlockedAt: new Date().toISOString() };
          await saveJSON(STORAGE_KEYS.aeroclubAccess, next);
          setStored(next);
          router.replace("/aeroclub");
        }
      } finally { setBusy(false); }
    };

    if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}>

          <View style={styles.head}>
            <View style={[styles.iconBubble, { backgroundColor: colors.primary + "26" }]}>
              <Feather name="users" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>ACCESO PREMIUM</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Mi Aeroclub</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                Gestión de vencimientos, libro técnico y reservas. Funciones disponibles con suscripción activa.
              </Text>
            </View>
          </View>

          <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {(["login", "register"] as Mode[]).map((m) => {
              const active = mode === m;
              return (
                <Pressable key={m} onPress={() => setMode(m)}
                  style={({ pressed }) => [styles.tab, { backgroundColor: active ? colors.primary : "transparent", borderRadius: colors.radius - 4, opacity: pressed ? 0.85 : 1 }]}>
                  <Text style={[styles.tabText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
                    {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {mode === "register" && <FormField label="Nombre" value={nameInput} onChangeText={setNameInput} placeholder="Cómo te llamás" autoCapitalize="words" />}
            <FormField label="Email" value={emailInput} onChangeText={setEmailInput} placeholder="tu@email.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
            <FormField label="Contraseña" value={passInput} onChangeText={setPassInput} placeholder="••••••••" secureTextEntry autoCapitalize="none" />
            <PrimaryButton label={mode === "login" ? "Ingresar" : "Crear cuenta"} icon={mode === "login" ? "log-in" : "user-plus"} full onPress={submit} disabled={busy} />
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Las credenciales se guardan localmente en este dispositivo.
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUSCRIPCIÓN</Text>
            <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={styles.subHead}>
                <Feather name="credit-card" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subTitle, { color: colors.foreground }]}>Activá tu suscripción</Text>
                  <Text style={[styles.subPrice, { color: colors.primary }]}>{priceLine}</Text>
                </View>
              </View>
              <Text style={[styles.subDesc, { color: colors.mutedForeground }]}>
                Realizá la transferencia a la cuenta indicada y enviá el comprobante por WhatsApp para activar el acceso.
              </Text>
              {!cbuConfigured ? (
                <View style={[styles.warnBox, { borderColor: colors.warning, backgroundColor: colors.warning + "1A" }]}>
                  <Feather name="alert-circle" size={14} color={colors.warning} />
                  <Text style={[styles.warnText, { color: colors.warning }]}>Datos bancarios pendientes de configurar (lib/subscription.ts).</Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  <BankRow label="CBU" value={subscription.cbu} onCopy={() => copy("CBU", subscription.cbu)} />
                  {subscription.cvu ? <BankRow label="CVU" value={subscription.cvu} onCopy={() => copy("CVU", subscription.cvu!)} /> : null}
                  {subscription.alias ? <BankRow label="Alias" value={subscription.alias} onCopy={() => copy("Alias", subscription.alias!)} /> : null}
                  {subscription.titular ? <BankRow label="Titular" value={subscription.titular} /> : null}
                  {subscription.cuit ? <BankRow label="CUIT" value={subscription.cuit} /> : null}
                  {subscription.banco ? <BankRow label="Banco" value={subscription.banco} /> : null}
                </View>
              )}
              <PrimaryButton label="Enviar comprobante por WhatsApp" icon="message-circle" variant="secondary" full onPress={openWhatsApp} />
            </View>
          </View>
        </KeyboardAwareScrollViewCompat>
      </KeyboardAvoidingView>
    );
  }

  function BankRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
    const colors = useColors();
    return (
      <View style={[styles.bankRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.bankLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.bankValue, { color: colors.foreground }]} selectable numberOfLines={1}>{value}</Text>
        {onCopy && <Pressable onPress={onCopy} hitSlop={10} style={styles.copyBtn}><Feather name="copy" size={15} color={colors.primary} /></Pressable>}
      </View>
    );
  }

  const styles = StyleSheet.create({
    head: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    iconBubble: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
    title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 2 },
    sub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginTop: 4 },
    tabRow: { flexDirection: "row", padding: 4, borderWidth: 1, gap: 4 },
    tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
    tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
    card: { padding: 16, borderWidth: 1, gap: 12 },
    helper: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
    sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8 },
    subCard: { padding: 16, borderWidth: 1, gap: 12 },
    subHead: { flexDirection: "row", gap: 10, alignItems: "center" },
    subTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
    subPrice: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 2 },
    subDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
    warnBox: { flexDirection: "row", gap: 8, alignItems: "center", padding: 10, borderWidth: 1, borderRadius: 8 },
    warnText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
    bankRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 8 },
    bankLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5, width: 60 },
    bankValue: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
    copyBtn: { padding: 4 },
  });
  