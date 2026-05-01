import { Feather } from "@expo/vector-icons";
  import React, { useEffect, useMemo, useState } from "react";
  import {
    Alert,
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

  type Station = { id: string; label: string; weight: string; arm: string };

  type AircraftProfile = {
    model: string;
    mtow: string;
    cgFwd: string;
    cgAft: string;
    stations: Station[];
  };

  const CESSNA_152_DEFAULT: AircraftProfile = {
    model: "Cessna 152",
    mtow: "757",
    cgFwd: "0.78",
    cgAft: "1.04",
    stations: [
      { id: "bem",  label: "Peso vacío (BEM)",       weight: "525", arm: "0.85" },
      { id: "p1",   label: "Piloto + acompañante",   weight: "150", arm: "0.99" },
      { id: "fuel", label: "Combustible (kg)",        weight: "75",  arm: "1.07" },
      { id: "bag",  label: "Equipaje",               weight: "10",  arm: "1.85" },
    ],
  };

  function newId() {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  export default function PesoBalanceScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<AircraftProfile>(CESSNA_152_DEFAULT);
    const [loaded, setLoaded] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
      (async () => {
        const stored = await loadJSON<AircraftProfile | null>(STORAGE_KEYS.aircraftProfile, null);
        if (stored && Array.isArray(stored.stations)) setProfile(stored);
        setLoaded(true);
      })();
    }, []);

    const setField = <K extends keyof AircraftProfile>(field: K, value: AircraftProfile[K]) => {
      setProfile((p) => ({ ...p, [field]: value }));
      setDirty(true);
    };

    const updateStation = (id: string, field: keyof Omit<Station, "id">, v: string) => {
      setProfile((p) => ({ ...p, stations: p.stations.map((s) => s.id === id ? { ...s, [field]: v } : s) }));
      setDirty(true);
    };

    const addStation = () => {
      setProfile((p) => ({
        ...p,
        stations: [...p.stations, { id: newId(), label: "Nueva estación", weight: "0", arm: "0" }],
      }));
      setDirty(true);
    };

    const removeStation = (id: string) => {
      setProfile((p) => ({ ...p, stations: p.stations.filter((s) => s.id !== id) }));
      setDirty(true);
    };

    const save = async () => {
      await saveJSON(STORAGE_KEYS.aircraftProfile, profile);
      setDirty(false);
      Alert.alert("Aeronave guardada", "Los datos quedan disponibles para tu próximo cálculo.");
    };

    const resetToCessna152 = () => {
      Alert.alert("Restablecer plantilla", "¿Querés cargar la plantilla de Cessna 152?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Restablecer", style: "destructive", onPress: () => { setProfile(CESSNA_152_DEFAULT); setDirty(true); } },
      ]);
    };

    const totals = useMemo(() => {
      let totalW = 0, totalM = 0;
      for (const st of profile.stations) {
        const w = Number(st.weight) || 0;
        const a = Number(st.arm) || 0;
        totalW += w; totalM += w * a;
      }
      return { totalW, totalM, cg: totalW > 0 ? totalM / totalW : 0 };
    }, [profile.stations]);

    const mtow = Number(profile.mtow) || 0;
    const cgFwd = Number(profile.cgFwd) || 0;
    const cgAft = Number(profile.cgAft) || 0;
    const overWeight = mtow > 0 && totals.totalW > mtow;
    const cgOk = cgFwd > 0 && cgAft > 0 && totals.cg >= cgFwd && totals.cg <= cgAft;

    if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

    return (
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }}
      >
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Cargá los datos de tu aeronave (POH/AFM). Quedan guardados en este dispositivo para el próximo cálculo.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Aeronave</Text>
          <FormField label="Modelo" value={profile.model} onChangeText={(v) => setField("model", v)} placeholder="Ej. Cessna 152" />
          <View style={styles.inputs}>
            <View style={{ flex: 1 }}>
              <FormField label="MTOW (kg)" value={profile.mtow} onChangeText={(v) => setField("mtow", v)} keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.inputs}>
            <View style={{ flex: 1 }}>
              <FormField label="CG fwd (m)" value={profile.cgFwd} onChangeText={(v) => setField("cgFwd", v)} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="CG aft (m)" value={profile.cgAft} onChangeText={(v) => setField("cgAft", v)} keyboardType="decimal-pad" />
            </View>
          </View>
          <Pressable onPress={resetToCessna152} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.linkAction, { color: colors.primary }]}>Restablecer plantilla Cessna 152</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ESTACIONES</Text>

        {profile.stations.map((st) => (
          <View key={st.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
            <View style={styles.rowHead}>
              <View style={{ flex: 1 }}>
                <FormField label="Estación" value={st.label} onChangeText={(v) => updateStation(st.id, "label", v)} placeholder="Piloto, combustible…" />
              </View>
              <Pressable
                onPress={() => removeStation(st.id)}
                hitSlop={10}
                style={({ pressed }) => [styles.delBtn, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius - 4, opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </View>
            <View style={styles.inputs}>
              <View style={{ flex: 1 }}>
                <FormField label="Peso (kg)" value={st.weight} onChangeText={(v) => updateStation(st.id, "weight", v)} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Brazo (m)" value={st.arm} onChangeText={(v) => updateStation(st.id, "arm", v)} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>
        ))}

        <PrimaryButton label="Agregar estación" icon="plus" variant="secondary" onPress={addStation} full />

        <View style={[styles.results, { backgroundColor: overWeight || !cgOk ? colors.destructive + "1A" : colors.card, borderColor: overWeight || !cgOk ? colors.destructive : colors.border, borderRadius: colors.radius }]}>
          <Result label="Peso total" value={`${totals.totalW.toFixed(1)} kg`} />
          <Result label="Momento total" value={`${totals.totalM.toFixed(2)} kg·m`} />
          <Result label="CG" value={`${totals.cg.toFixed(3)} m`} highlight />
          <Text style={[styles.verdict, { color: overWeight || !cgOk ? colors.destructive : colors.success }]}>
            {overWeight ? `EXCEDE peso máximo (${mtow} kg)` : !cgOk ? `CG fuera de límites (${cgFwd}–${cgAft} m)` : "Dentro de límites"}
          </Text>
        </View>

        <PrimaryButton label={dirty ? "Guardar aeronave" : "Aeronave guardada"} icon={dirty ? "save" : "check"} onPress={save} disabled={!dirty} full />
      </KeyboardAwareScrollViewCompat>
    );
  }

  function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    const colors = useColors();
    return (
      <View style={styles.resRow}>
        <Text style={[styles.resLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.resValue, { color: highlight ? colors.primary : colors.foreground, fontFamily: highlight ? "Inter_700Bold" : "Inter_600SemiBold" }]}>{value}</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    note: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
    sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.8, marginTop: 4 },
    card: { padding: 14, borderWidth: 1, gap: 10 },
    cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
    row: { padding: 14, borderWidth: 1, gap: 10 },
    rowHead: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
    inputs: { flexDirection: "row", gap: 10 },
    delBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 2 },
    linkAction: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 4 },
    results: { padding: 18, borderWidth: 1, gap: 10 },
    resRow: { flexDirection: "row", justifyContent: "space-between" },
    resLabel: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" },
    resValue: { fontSize: 16 },
    verdict: { fontFamily: "Inter_700Bold", fontSize: 13, textAlign: "center", marginTop: 8, letterSpacing: 0.5 },
  });
  