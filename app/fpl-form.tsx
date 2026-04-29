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
  dinghiesCount: string;
  dinghiesCapacity: string;
  dinghiesCover: boolean;
  dinghiesColour: string;
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
  number: "1",
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
  dinghiesCount: "",
  dinghiesCapacity: "",
  dinghiesCover: false,
  dinghiesColour: "",
  aircraftColour: "",
  remarks: "",
  pilotInCommand: "",
  filedBy: "",
};

/* ═══════════════════════════════════════════
   COMPONENTE DEL FORMULARIO (reutilizable)
   Se usa tanto para el form activo como para
   el ViewShot oculto que captura el blanco
═══════════════════════════════════════════ */
function FplFormContent({
  fpl,
  colors,
  onSet,
  readonly = false,
}: {
  fpl: FplData;
  colors: ReturnType<typeof useColors>;
  onSet?: <K extends keyof FplData>(key: K, val: FplData[K]) => void;
  readonly?: boolean;
}) {
  const set = onSet ?? (() => {});

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.input,
      borderColor: colors.border,
      color: colors.foreground,
      borderRadius: colors.radius - 6,
    },
  ];
  const multilineStyle = [
    ...inputStyle,
    { minHeight: 72, textAlignVertical: "top" as const },
  ];
  const lblEs = [styles.labelEs, { color: colors.foreground }];
  const lblEn = [styles.labelEn, { color: colors.mutedForeground }];

  return (
    <View style={styles.body}>

      {/* ── FECHA + Item 7 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="FECHA" en="DATE" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.date}
              onChangeText={(v) => set("date", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={2}>
            <Label
              es="7 IDENTIFICACIÓN DE LA AERONAVE"
              en="AIRCRAFT IDENTIFICATION (*)"
              lblEs={lblEs}
              lblEn={lblEn}
            />
            <TextInput
              value={fpl.aircraftId}
              onChangeText={(v) => set("aircraftId", v.toUpperCase())}
              placeholder="LV-ABC"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 8 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="8 REGLAS DE VUELO" en="FLIGHT RULES (*)" lblEs={lblEs} lblEn={lblEn} />
            <ChipRow
              options={FLIGHT_RULES as unknown as string[]}
              selected={fpl.flightRules}
              onSelect={(v) => set("flightRules", v)}
              colors={colors}
              readonly={readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="TIPO DE VUELO" en="TYPE OF FLIGHT (*)" lblEs={lblEs} lblEn={lblEn} />
            <ChipRow
              options={FLIGHT_TYPES as unknown as string[]}
              selected={fpl.flightType}
              onSelect={(v) => set("flightType", v)}
              colors={colors}
              readonly={readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 9 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={0.6}>
            <Label es="9 NÚM." en="NUMBER" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.number}
              onChangeText={(v) => set("number", v)}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1.2}>
            <Label es="TIPO DE AERONAVE" en="TYPE OF AIRCRAFT (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.aircraftType}
              onChangeText={(v) => set("aircraftType", v.toUpperCase())}
              placeholder="C172"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1.2}>
            <Label es="ESTELA TURBULENTA" en="WAKE TURBULENCE CAT (*)" lblEs={lblEs} lblEn={lblEn} />
            <ChipRow
              options={WAKE_CATS as unknown as string[]}
              selected={fpl.wakeCat}
              onSelect={(v) => set("wakeCat", v)}
              colors={colors}
              labels={["L - Liviana", "M - Media", "H - Pesada"]}
              readonly={readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 10 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="10 EQUIPO / EQUIPMENT (A) (*)" en="" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.equipmentA}
              onChangeText={(v) => set("equipmentA", v.toUpperCase())}
              placeholder="SDFG"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="EQUIPO / EQUIPMENT (B) (*)" en="" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.equipmentB}
              onChangeText={(v) => set("equipmentB", v.toUpperCase())}
              placeholder="S"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 13 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1.4}>
            <Label es="13 AERÓDROMO DE SALIDA" en="DEPARTURE AERODROME (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.departureAd}
              onChangeText={(v) => set("departureAd", v.toUpperCase())}
              placeholder="SADF"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="HORA (UTC)" en="TIME (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.departureTime}
              onChangeText={(v) => set("departureTime", v)}
              placeholder="1200"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 15 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="15 VELOCIDAD DE CRUCERO" en="CRUISING SPEED (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.cruisingSpeed}
              onChangeText={(v) => set("cruisingSpeed", v.toUpperCase())}
              placeholder="N0110"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={0.9}>
            <Label es="NIVEL" en="LEVEL (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.level}
              onChangeText={(v) => set("level", v.toUpperCase())}
              placeholder="F045"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
        <View style={{ marginTop: 10 }}>
          <Label es="RUTA" en="ROUTE (*)" lblEs={lblEs} lblEn={lblEn} />
          <TextInput
            value={fpl.route}
            onChangeText={(v) => set("route", v.toUpperCase())}
            placeholder="DCT SURBI W21 LAPRIDA"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            multiline
            numberOfLines={2}
            style={multilineStyle}
            editable={!readonly}
          />
        </View>
      </SectionBox>

      {/* ── Item 16 ── */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="16 AERÓDROMO DE DESTINO" en="DESTINATION AERODROME (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.destinationAd}
              onChangeText={(v) => set("destinationAd", v.toUpperCase())}
              placeholder="SAEZ"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={0.9}>
            <Label es="DURACIÓN TOTAL" en="TOTAL EET (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.totalEet}
              onChangeText={(v) => set("totalEet", v)}
              placeholder="0130"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <Field flex={1}>
            <Label es="ALTERNATIVA" en="ALTN AERODROME (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.altnAd}
              onChangeText={(v) => set("altnAd", v.toUpperCase())}
              placeholder="SABE"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="2DA ALTERNATIVA" en="2ND ALTN AERODROME" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.altn2Ad}
              onChangeText={(v) => set("altn2Ad", v.toUpperCase())}
              placeholder="—"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* ── Item 18 ── */}
      <SectionBox colors={colors}>
        <Label es="18 OTRA INFORMACIÓN" en="OTHER INFORMATION (*)" lblEs={lblEs} lblEn={lblEn} />
        <View
          style={[
            styles.infoHint,
            { backgroundColor: colors.primary + "18", borderRadius: colors.radius - 6 },
          ]}
        >
          <Text style={[styles.infoHintTxt, { color: colors.foreground }]}>
            <Text style={{ fontWeight: "700" }}>STS/ PBN/ </Text>
            NAV/ COM/ DAT/ SUR/ DEP/ DEST/ DOF/ REG/{" "}
            <Text style={{ fontWeight: "700" }}>EET/ </Text>
            SEL/ TYP/ CODE/ DLE/ OPR/ ORGN/{" "}
            <Text style={{ fontWeight: "700" }}>PER/ </Text>
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
          style={multilineStyle}
          editable={!readonly}
        />
      </SectionBox>

      {/* ── Encabezado Item 19 ── */}
      <View
        style={[
          styles.secHeader,
          { backgroundColor: colors.primary + "22", borderColor: colors.primary },
        ]}
      >
        <Text style={[styles.secHeaderTxt, { color: colors.primary }]}>
          19 INFORMACIÓN SUPLEMENTARIA / SUPPLEMENTARY INFORMATION
        </Text>
      </View>

      {/* Autonomía + PAX */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="AUTONOMÍA (HHMM)" en="ENDURANCE (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.endurance}
              onChangeText={(v) => set("endurance", v)}
              placeholder="0400"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={4}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="PERSONAS A BORDO" en="PERSONS ON BOARD (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.personsOnBoard}
              onChangeText={(v) => set("personsOnBoard", v)}
              placeholder="2"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* Radio emergencia */}
      <SectionBox colors={colors}>
        <Label es="RADIO DE EMERGENCIA" en="EMERGENCY RADIO" lblEs={lblEs} lblEn={lblEn} />
        <View style={styles.toggleGrid}>
          <Tog label="UHF" value={fpl.radioUhf} onToggle={(v) => set("radioUhf", v)} colors={colors} readonly={readonly} />
          <Tog label="VHF" value={fpl.radioVhf} onToggle={(v) => set("radioVhf", v)} colors={colors} readonly={readonly} />
          <Tog label="ELT" value={fpl.radioElt} onToggle={(v) => set("radioElt", v)} colors={colors} readonly={readonly} />
        </View>
      </SectionBox>

      {/* Supervivencia */}
      <SectionBox colors={colors}>
        <Label es="EQUIPO DE SUPERVIVENCIA" en="SURVIVAL EQUIPMENT" lblEs={lblEs} lblEn={lblEn} />
        <View style={styles.toggleGrid}>
          <Tog label="Polar" value={fpl.survivalPolar} onToggle={(v) => set("survivalPolar", v)} colors={colors} readonly={readonly} />
          <Tog label="Desierto / Desert" value={fpl.survivalDesert} onToggle={(v) => set("survivalDesert", v)} colors={colors} readonly={readonly} />
          <Tog label="Marítimo / Maritime" value={fpl.survivalMaritime} onToggle={(v) => set("survivalMaritime", v)} colors={colors} readonly={readonly} />
          <Tog label="Selva / Jungle" value={fpl.survivalJungle} onToggle={(v) => set("survivalJungle", v)} colors={colors} readonly={readonly} />
        </View>
      </SectionBox>

      {/* Chalecos */}
      <SectionBox colors={colors}>
        <Label es="CHALECOS" en="JACKETS" lblEs={lblEs} lblEn={lblEn} />
        <View style={styles.toggleGrid}>
          <Tog label="Luz / Light" value={fpl.jacketsLight} onToggle={(v) => set("jacketsLight", v)} colors={colors} readonly={readonly} />
          <Tog label="Fluores." value={fpl.jacketsFluores} onToggle={(v) => set("jacketsFluores", v)} colors={colors} readonly={readonly} />
          <Tog label="UHF" value={fpl.jacketsUhf} onToggle={(v) => set("jacketsUhf", v)} colors={colors} readonly={readonly} />
          <Tog label="VHF" value={fpl.jacketsVhf} onToggle={(v) => set("jacketsVhf", v)} colors={colors} readonly={readonly} />
        </View>
      </SectionBox>

      {/* Botes */}
      <SectionBox colors={colors}>
        <Label es="BOTES SALVAVIDAS" en="DINGHIES" lblEs={lblEs} lblEn={lblEn} />
        <View style={styles.row}>
          <Field flex={1}>
            <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>Cantidad / Number</Text>
            <TextInput
              value={fpl.dinghiesCount}
              onChangeText={(v) => set("dinghiesCount", v)}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>Capacidad / Capacity</Text>
            <TextInput
              value={fpl.dinghiesCapacity}
              onChangeText={(v) => set("dinghiesCapacity", v)}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>Color</Text>
            <TextInput
              value={fpl.dinghiesColour}
              onChangeText={(v) => set("dinghiesColour", v.toUpperCase())}
              placeholder="NARANJA"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
        <View style={{ marginTop: 8 }}>
          <Tog label="Con cubierta / Cover" value={fpl.dinghiesCover} onToggle={(v) => set("dinghiesCover", v)} colors={colors} readonly={readonly} />
        </View>
      </SectionBox>

      {/* Color aeronave */}
      <SectionBox colors={colors}>
        <Label es="COLOR Y MARCAS DE LA AERONAVE" en="AIRCRAFT COLOUR AND MARKINGS" lblEs={lblEs} lblEn={lblEn} />
        <TextInput
          value={fpl.aircraftColour}
          onChangeText={(v) => set("aircraftColour", v.toUpperCase())}
          placeholder="BLANCO Y AZUL / WHITE AND BLUE"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="characters"
          style={inputStyle}
          editable={!readonly}
        />
      </SectionBox>

      {/* Observaciones */}
      <SectionBox colors={colors}>
        <Label es="OBSERVACIONES" en="REMARKS" lblEs={lblEs} lblEn={lblEn} />
        <TextInput
          value={fpl.remarks}
          onChangeText={(v) => set("remarks", v)}
          placeholder="—"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={2}
          style={multilineStyle}
          editable={!readonly}
        />
      </SectionBox>

      {/* Piloto + Presentado por */}
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="PILOTO AL MANDO" en="PILOT IN-COMMAND (*)" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.pilotInCommand}
              onChangeText={(v) => set("pilotInCommand", v.toUpperCase())}
              placeholder="APELLIDO, NOMBRE"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="PRESENTADO POR" en="FILED BY" lblEs={lblEs} lblEn={lblEn} />
            <TextInput
              value={fpl.filedBy}
              onChangeText={(v) => set("filedBy", v.toUpperCase())}
              placeholder="APELLIDO, NOMBRE"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      {/* Firma */}
      <View style={[styles.signArea, { borderColor: colors.border }]}>
        <Text style={[styles.signLabel, { color: colors.mutedForeground }]}>
          FIRMA / SIGN HERE
        </Text>
      </View>

      {/* Pie */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardFooterTxt, { color: colors.mutedForeground }]}>
          AeroUtil · Plan de Vuelo ICAO · Formulario FPL
        </Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   PANTALLA PRINCIPAL
═══════════════════════════════════════════ */
export default function FplFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [fpl, setFpl] = useState<FplData>(BLANK);
  const [capturing, setCapturing] = useState(false);

  // ViewShot del formulario activo (con datos)
  const shotFilled = useRef<ViewShot>(null);
  // ViewShot del formulario en blanco (siempre renderizado, fuera de pantalla)
  const shotBlank = useRef<ViewShot>(null);

  const set = <K extends keyof FplData>(key: K, val: FplData[K]) =>
    setFpl((p) => ({ ...p, [key]: val }));

  /* ── helper: compartir/descargar una URI ── */
  const shareUri = async (uri: string, filename: string) => {
    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      Alert.alert("Éxito", "Imagen descargada correctamente.");
    } else {
      const destFile = new ExpoFile(Paths.cache, filename);
      await new ExpoFile(uri).copy(destFile);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destFile.uri, {
          mimeType: "image/png",
          dialogTitle: "Compartir Plan de Vuelo",
          UTI: "public.png",
        });
      } else {
        Alert.alert("Guardado", `Archivo en:\n${destFile.uri}`);
      }
    }
  };

  /* ── helper: imprimir una URI ── */
  const printUri = async (uri: string, title: string) => {
    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      const blobUrl = URL.createObjectURL(blob);
      const w = window.open();
      if (w) {
        w.document.write(`
          <html><head><title>${title}</title>
          <style>
            body{margin:0;padding:20px;display:flex;justify-content:center;background:#fff}
            img{max-width:100%;height:auto}
            @media print{body{padding:0}img{width:100%}}
          </style></head>
          <body>
            <img src="${blobUrl}"
              onload="window.print();setTimeout(()=>window.close(),1500)"/>
          </body></html>
        `);
        w.document.close();
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 8000);
    } else {
      await Print.printAsync({
        html: `<html><body style="margin:0;padding:0;background:#fff">
          <img src="${uri}" style="width:100%;height:auto"/>
        </body></html>`,
      });
    }
  };

  /* ── descargar lleno ── */
  const downloadFilled = async () => {
    try {
      setCapturing(true);
      if (!shotFilled.current?.capture) throw new Error("ref no disponible");
      const uri = await shotFilled.current.capture();
      const filename = `FPL_${fpl.aircraftId || "lleno"}_${fpl.date || "sin-fecha"}.png`;
      await shareUri(uri, filename);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo generar la imagen del formulario.");
    } finally {
      setCapturing(false);
    }
  };

  /* ── descargar en blanco ── */
  const downloadBlank = async () => {
    try {
      setCapturing(true);
      if (!shotBlank.current?.capture) throw new Error("ref no disponible");
      const uri = await shotBlank.current.capture();
      await shareUri(uri, "FPL_en-blanco.png");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo generar la imagen en blanco.");
    } finally {
      setCapturing(false);
    }
  };

  /* ── imprimir lleno ── */
  const printFilled = async () => {
    try {
      setCapturing(true);
      if (!shotFilled.current?.capture) throw new Error("ref no disponible");
      const uri = await shotFilled.current.capture();
      await printUri(uri, `FPL - ${fpl.aircraftId || "Plan de Vuelo"}`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo preparar la impresión.");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ══ ViewShot OCULTO: siempre renderiza BLANK ══
          Posicionado fuera de pantalla para que no sea visible
          pero sí renderizado (necesario para capture()) */}
      <View
        style={{
          position: "absolute",
          top: -9999,
          left: 0,
          width: 390,
          opacity: 0,
          pointerEvents: "none",
        }}
        // @ts-ignore - pointerEvents no tipado en todas las versiones
      >
        <ViewShot
          ref={shotBlank}
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
          <View
            style={[
              styles.cardHeader,
              {
                backgroundColor: colors.primary,
                borderTopLeftRadius: colors.radius,
                borderTopRightRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.cardHeaderTxt, { color: colors.primaryForeground }]}>
              PLAN DE VUELO — FLIGHT PLAN (FPL)
            </Text>
          </View>
          <FplFormContent fpl={BLANK} colors={colors} readonly />
        </ViewShot>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 150,
          paddingHorizontal: 14,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* título */}
        <View style={{ alignItems: "center", paddingTop: 10 }}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            PLAN DE VUELO / FLIGHT PLAN
          </Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Formulario ICAO · Completá, descargá, imprimí y compartí
          </Text>
        </View>

        {/* ══ ViewShot VISIBLE: formulario con datos ══ */}
        <ViewShot
          ref={shotFilled}
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
          <View
            style={[
              styles.cardHeader,
              {
                backgroundColor: colors.primary,
                borderTopLeftRadius: capturing ? 0 : colors.radius,
                borderTopRightRadius: capturing ? 0 : colors.radius,
              },
            ]}
          >
            <Text style={[styles.cardHeaderTxt, { color: colors.primaryForeground }]}>
              PLAN DE VUELO — FLIGHT PLAN (FPL)
            </Text>
          </View>
          <FplFormContent fpl={fpl} colors={colors} onSet={set} />
        </ViewShot>
      </ScrollView>

      {/* ══ BARRA INFERIOR ══ */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 14,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* Limpiar */}
        <Pressable
          onPress={() => setFpl(BLANK)}
          style={({ pressed }) => [
            styles.btnOutline,
            {
              borderColor: colors.border,
              borderRadius: colors.radius - 6,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
          <Text style={[styles.btnOutlineTxt, { color: colors.foreground }]}>Limpiar</Text>
        </Pressable>

        {/* En blanco */}
        <Pressable
          onPress={downloadBlank}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnOutline,
            {
              borderColor: colors.primary,
              borderRadius: colors.radius - 6,
              opacity: capturing ? 0.45 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather name="file" size={15} color={colors.primary} />
          <Text style={[styles.btnOutlineTxt, { color: colors.primary }]}>En blanco</Text>
        </Pressable>

        {/* Descargar */}
        <Pressable
          onPress={downloadFilled}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnSolid,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 6,
              opacity: capturing ? 0.45 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="download" size={15} color={colors.primaryForeground} />
          <Text style={[styles.btnSolidTxt, { color: colors.primaryForeground }]}>
            {capturing ? "Generando…" : "Descargar"}
          </Text>
        </Pressable>

        {/* Imprimir */}
        <Pressable
          onPress={printFilled}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnOutline,
            {
              borderColor: colors.primary,
              borderRadius: colors.radius - 6,
              opacity: capturing ? 0.45 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather name="printer" size={15} color={colors.primary} />
          <Text style={[styles.btnOutlineTxt, { color: colors.primary }]}>Imprimir</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ───── componentes auxiliares ───── */

function SectionBox({ colors, children }: { colors: ReturnType<typeof useColors>; children: React.ReactNode }) {
  return (
    <View style={[styles.sectionBox, { borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
      {children}
    </View>
  );
}

function Label({ es, en, lblEs, lblEn }: { es: string; en: string; lblEs: object[]; lblEn: object[] }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={lblEs}>{es}</Text>
      {en !== "" && <Text style={lblEn}>{en}</Text>}
    </View>
  );
}

function Field({ flex, children }: { flex: number; children: React.ReactNode }) {
  return <View style={{ flex }}>{children}</View>;
}

function ChipRow({
  options, selected, onSelect, colors, labels, readonly,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  colors: ReturnType<typeof useColors>;
  labels?: string[];
  readonly?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o, i) => {
        const active = selected === o;
        return (
          <Pressable
            key={o}
            onPress={() => !readonly && onSelect(o)}
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
              {labels ? labels[i] : o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tog({
  label, value, onToggle, colors, readonly,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
  readonly?: boolean;
}) {
  return (
    <View style={styles.togItem}>
      <Switch
        value={value}
        onValueChange={(v) => !readonly && onToggle(v)}
        trackColor={{ false: colors.border, true: colors.primary + "80" }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
        style={{ transform: [{ scale: 0.78 }] }}
        disabled={readonly}
      />
      <Text style={[styles.togLabel, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

/* ───── estilos ───── */
const styles = StyleSheet.create({
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3, textAlign: "center" },
  pageSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3, textAlign: "center" },
  card: { borderWidth: 1, overflow: "hidden" },
  cardHeader: { padding: 14, alignItems: "center" },
  cardHeaderTxt: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1.4 },
  body: { padding: 14, gap: 10 },
  sectionBox: { borderWidth: 1, padding: 12 },
  secHeader: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  secHeaderTxt: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.7, textAlign: "center" },
  row: { flexDirection: "row", gap: 10 },
  labelEs: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" },
  labelEn: { fontFamily: "Inter_400Regular", fontSize: 8.5, letterSpacing: 0.3, opacity: 0.65, marginTop: 1 },
  subLabel: { fontFamily: "Inter_400Regular", fontSize: 9, marginBottom: 4 },
  input: { fontFamily: "Inter_500Medium", fontSize: 14, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, marginTop: 2 },
  chipRow: { flexDirection: "row", gap: 5, flexWrap: "wrap", marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1 },
  chipTxt: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  infoHint: { padding: 10, marginBottom: 8 },
  infoHintTxt: { fontFamily: "Inter_400Regular", fontSize: 9, lineHeight: 15 },
  toggleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  togItem: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 90 },
  togLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
  signArea: { borderWidth: 1, borderStyle: "dashed", borderRadius: 6, height: 70, justifyContent: "flex-end", alignItems: "center", paddingBottom: 8 },
  signLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },
  cardFooter: { borderTopWidth: 1, paddingTop: 10, alignItems: "center" },
  cardFooterTxt: { fontFamily: "Inter_400Regular", fontSize: 9 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, paddingTop: 10, borderTopWidth: 1, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btnOutline: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  btnOutlineTxt: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  btnSolid: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  btnSolidTxt: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
