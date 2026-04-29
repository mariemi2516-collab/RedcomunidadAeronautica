import { Feather } from "@expo/vector-icons";
import { Paths, File as ExpoFile } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import { useColors } from "@/hooks/useColors";

/* ───── constantes ───── */

const FLIGHT_RULES = ["I", "V", "Y", "Z"] as const;
const FLIGHT_TYPES = ["S", "N", "G", "M", "X"] as const;
const WAKE_CATS = ["L", "M", "H"] as const;

/* ───── tipos ───── */

type FplData = {
  date: string;
  aircraftId: string;
  flightRules: string;
  flightType: string;
  number: string;
  aircraftType: string;
  wakeCat: string;
  equipmentA: string;
  equipmentB: string;
  departureAd: string;
  departureTime: string;
  cruisingSpeed: string;
  level: string;
  route: string;
  destinationAd: string;
  totalEet: string;
  altnAd: string;
  altn2Ad: string;
  otherInfo: string;
  endurance: string;
  personsOnBoard: string;
  radioUhf: boolean;
  radioVhf: boolean;
  radioElt: boolean;
  survivalPolar: boolean;
  survivalDesert: boolean;
  survivalMaritime: boolean;
  survivalJungle: boolean;
  jacketsLight: boolean;
  jacketsFluores: boolean;
  jacketsUhf: boolean;
  jacketsVhf: boolean;
  dinghies: boolean;
  aircraftColour: string;
  remarks: string;
  pilotInCommand: string;
  filedBy: string;
};

const BLANK: FplData = {
  date: "",
  aircraftId: "",
  flightRules: "",
  flightType: "",
  number: "",
  aircraftType: "",
  wakeCat: "",
  equipmentA: "",
  equipmentB: "",
  departureAd: "",
  departureTime: "",
  cruisingSpeed: "",
  level: "",
  route: "",
  destinationAd: "",
  totalEet: "",
  altnAd: "",
  altn2Ad: "",
  otherInfo: "",
  endurance: "",
  personsOnBoard: "",
  radioUhf: false,
  radioVhf: true,
  radioElt: true,
  survivalPolar: false,
  survivalDesert: false,
  survivalMaritime: false,
  survivalJungle: false,
  jacketsLight: false,
  jacketsFluores: false,
  jacketsUhf: false,
  jacketsVhf: false,
  dinghies: false,
  aircraftColour: "",
  remarks: "",
  pilotInCommand: "",
  filedBy: "",
};

/* ───── pantalla ───── */

export default function FplFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [fpl, setFpl] = useState<FplData>(BLANK);
  const [capturing, setCapturing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const set = <K extends keyof FplData>(key: K, val: FplData[K]) =>
    setFpl((p) => ({ ...p, [key]: val }));

  /* ── captura y compartir ── */
  const capture = async (mode: "filled" | "blank") => {
    const savedFpl = { ...fpl }; // guardar SIEMPRE antes de todo

    try {
      setCapturing(true);

      if (mode === "blank") {
        setFpl(BLANK);
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!viewShotRef.current?.capture) {
        Alert.alert("Error", "No se pudo inicializar la captura.");
        return;
      }

      const uri = await viewShotRef.current.capture();
      const tag = mode === "blank" ? "en-blanco" : fpl.aircraftId || "lleno";
      const filename = `FPL_${tag}_${fpl.date || "sin-fecha"}.png`;

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        Alert.alert("Éxito", "Archivo descargado correctamente");
        return;
      }

      // iOS / Android
      const destFile = new ExpoFile(Paths.cache, filename);
      const srcFile = new ExpoFile(uri);
      await srcFile.copy(destFile);
      const dest = destFile.uri;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dest, {
          mimeType: "image/png",
          dialogTitle: "Compartir Plan de Vuelo",
          UTI: "public.png",
        });
      } else {
        Alert.alert("Guardado", `Archivo guardado en:\n${dest}`);
      }
    } catch (error) {
      console.error("Error en captura:", error);
      Alert.alert("Error", "No se pudo generar la imagen.");
    } finally {
      // se ejecuta SIEMPRE, haya error o no
      if (mode === "blank") setFpl(savedFpl);
      setCapturing(false);
    }
  };

  /* ── imprimir (web + móvil) ── */
  const imprimir = async () => {
    try {
      setCapturing(true);

      if (!viewShotRef.current?.capture) {
        Alert.alert("Error", "No se pudo capturar el formulario");
        return;
      }

      const uri = await viewShotRef.current.capture();

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const ventanaImpresion = window.open();
        if (ventanaImpresion) {
          ventanaImpresion.document.write(`
            <html>
              <head>
                <title>Plan de Vuelo - ${fpl.aircraftId || "FPL"}</title>
                <style>
                  body {
                    margin: 0; padding: 20px; display: flex;
                    justify-content: center; align-items: center;
                    min-height: 100vh; background: white;
                  }
                  img { max-width: 100%; height: auto;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                  @media print {
                    body { margin: 0; padding: 0; }
                    img { box-shadow: none; }
                  }
                </style>
              </head>
              <body>
                <img src="${blobUrl}"
                  onload="window.print(); setTimeout(() => window.close(), 1000);" />
              </body>
            </html>
          `);
          ventanaImpresion.document.close();
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      } else {
        // ✅ iOS / Android — impresión nativa
        const html = `
          <html>
            <body style="margin:0;padding:0;background:white;">
              <img src="${uri}" style="width:100%;height:auto;" />
            </body>
          </html>
        `;
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error("Error en impresión:", error);
      Alert.alert("Error", "No se pudo preparar la impresión");
    } finally {
      setCapturing(false);
    }
  };

  /* ── estilos dinámicos ── */
  const inputBg = colors.input;
  const inputStyle = [
    styles.input,
    {
      backgroundColor: inputBg,
      borderColor: colors.border,
      color: colors.foreground,
      borderRadius: colors.radius - 6,
    },
  ];

  const lblEs = [styles.labelEs, { color: colors.foreground }];
  const lblEn = [styles.labelEn, { color: colors.mutedForeground }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: 14,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título */}
        <View style={{ alignItems: "center", paddingTop: 8 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            PLAN DE VUELO / FLIGHT PLAN
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Formulario ICAO — Completá, descargá, imprimí y compartí
          </Text>
        </View>

        {/* ===== FORMULARIO CAPTURABLE ===== */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1, result: "tmpfile" }}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          {/* header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.primary,
                borderTopLeftRadius: capturing ? 0 : colors.radius,
                borderTopRightRadius: capturing ? 0 : colors.radius,
              },
            ]}
          >
            <Text style={[styles.headerTxt, { color: colors.primaryForeground }]}>
              PLAN DE VUELO — FLIGHT PLAN (FPL)
            </Text>
          </View>

          <View style={styles.body}>
            {/* FECHA / DATE + Item 7 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel es="FECHA" en="DATE" styles={{ es: lblEs, en: lblEn }} />
                <TextInput
                  value={fpl.date}
                  onChangeText={(v) => set("date", v)}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.mutedForeground}
                  style={inputStyle}
                />
              </Field>
              <Field flex={1.5}>
                <BiLabel
                  es="7 IDENTIFICACIÓN AERONAVE"
                  en="AIRCRAFT IDENTIFICATION (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.aircraftId}
                  onChangeText={(v) => set("aircraftId", v.toUpperCase())}
                  placeholder="Ej: LV-ABC"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
            </View>

            {/* Item 8 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="8 REGLAS DE VUELO"
                  en="FLIGHT RULES (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <ChipRow
                  options={FLIGHT_RULES as unknown as string[]}
                  selected={fpl.flightRules}
                  onSelect={(v) => set("flightRules", v)}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="TIPO DE VUELO"
                  en="TYPE OF FLIGHT (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <ChipRow
                  options={FLIGHT_TYPES as unknown as string[]}
                  selected={fpl.flightType}
                  onSelect={(v) => set("flightType", v)}
                />
              </Field>
            </View>

            {/* Item 9 */}
            <View style={styles.row}>
              <Field flex={0.6}>
                <BiLabel es="9 NÚM." en="NUMBER" styles={{ es: lblEs, en: lblEn }} />
                <TextInput
                  value={fpl.number}
                  onChangeText={(v) => set("number", v)}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.mutedForeground}
                  style={inputStyle}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="TIPO AERONAVE"
                  en="TYPE OF AIRCRAFT (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.aircraftType}
                  onChangeText={(v) => set("aircraftType", v.toUpperCase())}
                  placeholder="C172"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="ESTELA TURBULENTA"
                  en="WAKE TURBULENCE CAT (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <ChipRow
                  options={WAKE_CATS as unknown as string[]}
                  selected={fpl.wakeCat}
                  onSelect={(v) => set("wakeCat", v)}
                />
              </Field>
            </View>

            {/* Item 10 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="10 EQUIPO / EQUIPMENT A (*)"
                  en=""
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.equipmentA}
                  onChangeText={(v) => set("equipmentA", v.toUpperCase())}
                  placeholder="SDFG"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="EQUIPO / EQUIPMENT B (*)"
                  en=""
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.equipmentB}
                  onChangeText={(v) => set("equipmentB", v.toUpperCase())}
                  placeholder="S"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
            </View>

            {/* Item 13 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="13 AERÓDROMO DE SALIDA"
                  en="DEPARTURE AERODROME (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.departureAd}
                  onChangeText={(v) => set("departureAd", v.toUpperCase())}
                  placeholder="SADF"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
              <Field flex={0.7}>
                <BiLabel es="HORA (UTC)" en="TIME" styles={{ es: lblEs, en: lblEn }} />
                <TextInput
                  value={fpl.departureTime}
                  onChangeText={(v) => set("departureTime", v)}
                  placeholder="1200"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
            </View>

            {/* Item 15 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="15 VELOCIDAD CRUCERO"
                  en="CRUISING SPEED (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.cruisingSpeed}
                  onChangeText={(v) => set("cruisingSpeed", v.toUpperCase())}
                  placeholder="N0110"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
              <Field flex={0.8}>
                <BiLabel es="NIVEL" en="LEVEL (*)" styles={{ es: lblEs, en: lblEn }} />
                <TextInput
                  value={fpl.level}
                  onChangeText={(v) => set("level", v.toUpperCase())}
                  placeholder="F045"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Field>
            </View>

            <Field flex={1}>
              <BiLabel es="RUTA" en="ROUTE (*)" styles={{ es: lblEs, en: lblEn }} />
              <TextInput
                value={fpl.route}
                onChangeText={(v) => set("route", v.toUpperCase())}
                placeholder="DCT SURBI W21 LAPRIDA"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                style={inputStyle}
              />
            </Field>

            {/* Item 16 */}
            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="16 DESTINO"
                  en="DESTINATION AERODROME (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.destinationAd}
                  onChangeText={(v) => set("destinationAd", v.toUpperCase())}
                  placeholder="SAEZ"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
              <Field flex={0.8}>
                <BiLabel
                  es="DURACIÓN TOTAL"
                  en="TOTAL EET (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.totalEet}
                  onChangeText={(v) => set("totalEet", v)}
                  placeholder="0130"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
            </View>

            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="ALTERNATIVA"
                  en="ALTN AERODROME (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.altnAd}
                  onChangeText={(v) => set("altnAd", v.toUpperCase())}
                  placeholder="SABE"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="2DA ALTERNATIVA"
                  en="2ND ALTN AERODROME"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.altn2Ad}
                  onChangeText={(v) => set("altn2Ad", v.toUpperCase())}
                  placeholder="—"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
            </View>

            {/* Item 18 */}
            <Field flex={1}>
              <BiLabel
                es="18 OTRA INFORMACIÓN"
                en="OTHER INFORMATION (*)"
                styles={{ es: lblEs, en: lblEn }}
              />
              <View
                style={[
                  styles.infoBar,
                  {
                    backgroundColor: colors.primary + "1A",
                    borderRadius: colors.radius - 6,
                  },
                ]}
              >
                <Text style={[styles.infoTxt, { color: colors.foreground }]}>
                  <Text style={styles.bold}>STS/ PBN/ </Text>
                  NAV/ COM/ DAT/ SUR/ DEP/ DEST/ DOF/ REG/{" "}
                  <Text style={styles.bold}>EET/ </Text>
                  SEL/ TYP/ CODE/ DLE/ OPR/ ORGN/{" "}
                  <Text style={styles.bold}>PER/ </Text>
                  ALTN/ RALT/ TALT/ RIF/ RMK/
                </Text>
              </View>
              <TextInput
                value={fpl.otherInfo}
                onChangeText={(v) => set("otherInfo", v.toUpperCase())}
                placeholder="DOF/260425 REG/LVABC PBN/B2C2D2S1"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                multiline
                numberOfLines={3}
                style={[...inputStyle, { minHeight: 64, textAlignVertical: "top" }]}
              />
            </Field>

            {/* ── Item 19 ── */}
            <View style={[styles.divider, { borderTopColor: colors.border }]}>
              <Text style={[styles.secTitle, { color: colors.primary }]}>
                19 INFORMACIÓN SUPLEMENTARIA / SUPPLEMENTARY INFORMATION
              </Text>
            </View>

            <View style={styles.row}>
              <Field flex={1}>
                <BiLabel
                  es="AUTONOMÍA"
                  en="ENDURANCE (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.endurance}
                  onChangeText={(v) => set("endurance", v)}
                  placeholder="0400"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  maxLength={4}
                  style={inputStyle}
                />
              </Field>
              <Field flex={1}>
                <BiLabel
                  es="PERSONAS A BORDO"
                  en="PERSONS ON BOARD (*)"
                  styles={{ es: lblEs, en: lblEn }}
                />
                <TextInput
                  value={fpl.personsOnBoard}
                  onChangeText={(v) => set("personsOnBoard", v)}
                  placeholder="2"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </Field>
            </View>

            {/* Radio de emergencia */}
            <Field flex={1}>
              <BiLabel
                es="RADIO DE EMERGENCIA"
                en="EMERGENCY RADIO"
                styles={{ es: lblEs, en: lblEn }}
              />
              <View style={styles.switchRow}>
                <Tog label="UHF" value={fpl.radioUhf} onToggle={(v) => set("radioUhf", v)} />
                <Tog label="VHF" value={fpl.radioVhf} onToggle={(v) => set("radioVhf", v)} />
                <Tog label="ELT" value={fpl.radioElt} onToggle={(v) => set("radioElt", v)} />
              </View>
            </Field>

            {/* Equipo de supervivencia */}
            <Field flex={1}>
              <BiLabel
                es="EQUIPO DE SUPERVIVENCIA"
                en="SURVIVAL EQUIPMENT"
                styles={{ es: lblEs, en: lblEn }}
              />
              <View style={styles.switchRow}>
                <Tog label="Polar" value={fpl.survivalPolar} onToggle={(v) => set("survivalPolar", v)} />
                <Tog label="Desierto / Desert" value={fpl.survivalDesert} onToggle={(v) => set("survivalDesert", v)} />
                <Tog label="Marítimo / Maritime" value={fpl.survivalMaritime} onToggle={(v) => set("survivalMaritime", v)} />
                <Tog label="Selva / Jungle" value={fpl.survivalJungle} onToggle={(v) => set("survivalJungle", v)} />
              </View>
            </Field>

            {/* Chalecos */}
            <Field flex={1}>
              <BiLabel es="CHALECOS" en="JACKETS" styles={{ es: lblEs, en: lblEn }} />
              <View style={styles.switchRow}>
                <Tog label="Luz / Light" value={fpl.jacketsLight} onToggle={(v) => set("jacketsLight", v)} />
                <Tog label="Fluor." value={fpl.jacketsFluores} onToggle={(v) => set("jacketsFluores", v)} />
                <Tog label="UHF" value={fpl.jacketsUhf} onToggle={(v) => set("jacketsUhf", v)} />
                <Tog label="VHF" value={fpl.jacketsVhf} onToggle={(v) => set("jacketsVhf", v)} />
              </View>
            </Field>

            {/* Botes */}
            <View style={styles.switchRow}>
              <Tog label="Botes / Dinghies" value={fpl.dinghies} onToggle={(v) => set("dinghies", v)} />
            </View>

            <Field flex={1}>
              <BiLabel
                es="COLOR Y MARCAS DE LA AERONAVE"
                en="AIRCRAFT COLOUR AND MARKINGS"
                styles={{ es: lblEs, en: lblEn }}
              />
              <TextInput
                value={fpl.aircraftColour}
                onChangeText={(v) => set("aircraftColour", v.toUpperCase())}
                placeholder="BLANCO Y AZUL"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                style={inputStyle}
              />
            </Field>

            <Field flex={1}>
              <BiLabel es="OBSERVACIONES" en="REMARKS" styles={{ es: lblEs, en: lblEn }} />
              <TextInput
                value={fpl.remarks}
                onChangeText={(v) => set("remarks", v)}
                placeholder="—"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
            </Field>

            <Field flex={1}>
              <BiLabel
                es="PILOTO AL MANDO"
                en="PILOT IN-COMMAND (*)"
                styles={{ es: lblEs, en: lblEn }}
              />
              <TextInput
                value={fpl.pilotInCommand}
                onChangeText={(v) => set("pilotInCommand", v.toUpperCase())}
                placeholder="Nombre completo"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                style={inputStyle}
              />
            </Field>

            <Field flex={1}>
              <BiLabel es="PRESENTADO POR" en="FILED BY" styles={{ es: lblEs, en: lblEn }} />
              <TextInput
                value={fpl.filedBy}
                onChangeText={(v) => set("filedBy", v.toUpperCase())}
                placeholder="Nombre completo"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                style={inputStyle}
              />
            </Field>

            <View style={[styles.formFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerTxt, { color: colors.mutedForeground }]}>
                AeroUtil · Plan de vuelo ICAO
              </Text>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      {/* ===== BARRA INFERIOR ===== */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 14,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => setFpl(BLANK)}
          style={({ pressed }) => [
            styles.btnSec,
            { borderColor: colors.border, borderRadius: colors.radius - 6, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
          <Text style={[styles.btnSecTxt, { color: colors.foreground }]}>Limpiar</Text>
        </Pressable>

        <Pressable
          onPress={() => capture("blank")}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnSec,
            { borderColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.5 : pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="file" size={15} color={colors.primary} />
          <Text style={[styles.btnSecTxt, { color: colors.primary }]}>En blanco</Text>
        </Pressable>

        <Pressable
          onPress={() => capture("filled")}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnPri,
            { backgroundColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.5 : pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="download" size={15} color={colors.primaryForeground} />
          <Text style={[styles.btnPriTxt, { color: colors.primaryForeground }]}>
            {capturing ? "Generando..." : "Descargar"}
          </Text>
        </Pressable>

        {/* Botón imprimir — todas las plataformas */}
        <Pressable
          onPress={imprimir}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnSec,
            { borderColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.5 : pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="printer" size={15} color={colors.primary} />
          <Text style={[styles.btnSecTxt, { color: colors.primary }]}>Imprimir</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ───── componentes auxiliares ───── */

function BiLabel({ es, en, styles: s }: { es: string; en: string; styles: { es: object[]; en: object[] } }) {
  return (
    <View style={{ marginBottom: 3 }}>
      <Text style={s.es}>{es}</Text>
      {en !== "" && <Text style={s.en}>{en}</Text>}
    </View>
  );
}

function Field({ flex, children }: { flex: number; children: React.ReactNode }) {
  return <View style={{ flex }}>{children}</View>;
}

function ChipRow({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.chipRow}>
      {options.map((o) => {
        const active = selected === o;
        return (
          <Pressable
            key={o}
            onPress={() => onSelect(o)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.input,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: colors.radius - 6,
              },
            ]}
          >
            <Text style={[styles.chipTxt, { color: active ? colors.primaryForeground : colors.foreground }]}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tog({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  const colors = useColors();
  return (
    <View style={styles.togItem}>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + "80" }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
        style={{ transform: [{ scale: 0.72 }] }}
      />
      <Text style={[styles.togLabel, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

/* ───── estilos ───── */

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
  card: { borderWidth: 1, overflow: "hidden" },
  header: { padding: 12, alignItems: "center" },
  headerTxt: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1.2 },
  body: { padding: 14, gap: 12 },
  row: { flexDirection: "row", gap: 10 },
  labelEs: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.6 },
  labelEn: { fontFamily: "Inter_400Regular", fontSize: 8.5, letterSpacing: 0.4, opacity: 0.7 },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1 },
  chipTxt: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bold: { fontFamily: "Inter_700Bold" },
  infoBar: { padding: 10, marginBottom: 6 },
  infoTxt: { fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 15 },
  divider: { borderTopWidth: 1, paddingTop: 10 },
  secTitle: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.8 },
  switchRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  togItem: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 70 },
  togLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
  formFooter: { borderTopWidth: 1, paddingTop: 10, alignItems: "center" },
  footerTxt: { fontFamily: "Inter_400Regular", fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  btnSec: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  btnSecTxt: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  btnPri: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  btnPriTxt: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
