import { Feather } from "@expo/vector-icons";
import { Paths, File as ExpoFile } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import { useColors } from "@/hooks/useColors";

type AlfaData = {
  fecha: string;
  nombrePiloto: string;
  licencia: string;
  clase: string;
  vencimientoLicencia: string;
  matricula: string;
  tipoAeronave: string;
  certificadoAeronavegabilidad: string;
  vencimientoCertificado: string;
  seguro: string;
  poliza: string;
  vencimientoSeguro: string;
  mantenimientoUltimo: string;
  mantenimientoProximo: string;
  observaciones: string;
  firmaPiloto: string;
};

const BLANK: AlfaData = {
  fecha: "",
  nombrePiloto: "",
  licencia: "",
  clase: "",
  vencimientoLicencia: "",
  matricula: "",
  tipoAeronave: "",
  certificadoAeronavegabilidad: "",
  vencimientoCertificado: "",
  seguro: "",
  poliza: "",
  vencimientoSeguro: "",
  mantenimientoUltimo: "",
  mantenimientoProximo: "",
  observaciones: "",
  firmaPiloto: "",
};

function AlfaFormContent({
  data,
  colors,
  onSet,
  readonly = false,
}: {
  data: AlfaData;
  colors: ReturnType<typeof useColors>;
  onSet?: <K extends keyof AlfaData>(key: K, val: AlfaData[K]) => void;
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

  return (
    <View style={styles.body}>
      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="FECHA" lblEs={lblEs} />
            <TextInput
              value={data.fecha}
              onChangeText={(v) => set("fecha", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={2}>
            <Label es="NOMBRE DEL PILOTO" lblEs={lblEs} />
            <TextInput
              value={data.nombrePiloto}
              onChangeText={(v) => set("nombrePiloto", v.toUpperCase())}
              placeholder="APELLIDO, NOMBRE"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          LICENCIA DE PILOTO
        </Text>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="NÚMERO DE LICENCIA" lblEs={lblEs} />
            <TextInput
              value={data.licencia}
              onChangeText={(v) => set("licencia", v.toUpperCase())}
              placeholder="NÚMERO"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="CLASE" lblEs={lblEs} />
            <TextInput
              value={data.clase}
              onChangeText={(v) => set("clase", v.toUpperCase())}
              placeholder="PPA / PCA / CPL / ATPL"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1.2}>
            <Label es="VENCIMIENTO" lblEs={lblEs} />
            <TextInput
              value={data.vencimientoLicencia}
              onChangeText={(v) => set("vencimientoLicencia", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          AERONAVE
        </Text>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="MATRÍCULA" lblEs={lblEs} />
            <TextInput
              value={data.matricula}
              onChangeText={(v) => set("matricula", v.toUpperCase())}
              placeholder="LV-XXX"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="TIPO DE AERONAVE" lblEs={lblEs} />
            <TextInput
              value={data.tipoAeronave}
              onChangeText={(v) => set("tipoAeronave", v.toUpperCase())}
              placeholder="C172 / PA28 / ..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          CERTIFICADO DE AERONAVEGABILIDAD
        </Text>
        <View style={styles.row}>
          <Field flex={1.5}>
            <Label es="NÚMERO" lblEs={lblEs} />
            <TextInput
              value={data.certificadoAeronavegabilidad}
              onChangeText={(v) => set("certificadoAeronavegabilidad", v.toUpperCase())}
              placeholder="NÚMERO DE CERTIFICADO"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="VENCIMIENTO" lblEs={lblEs} />
            <TextInput
              value={data.vencimientoCertificado}
              onChangeText={(v) => set("vencimientoCertificado", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          SEGURO
        </Text>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="COMPAÑÍA" lblEs={lblEs} />
            <TextInput
              value={data.seguro}
              onChangeText={(v) => set("seguro", v.toUpperCase())}
              placeholder="COMPAÑÍA ASEGURADORA"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="PÓLIZA" lblEs={lblEs} />
            <TextInput
              value={data.poliza}
              onChangeText={(v) => set("poliza", v.toUpperCase())}
              placeholder="NÚMERO DE PÓLIZA"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="VENCIMIENTO" lblEs={lblEs} />
            <TextInput
              value={data.vencimientoSeguro}
              onChangeText={(v) => set("vencimientoSeguro", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          MANTENIMIENTO
        </Text>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="ÚLTIMO MANTENIMIENTO" lblEs={lblEs} />
            <TextInput
              value={data.mantenimientoUltimo}
              onChangeText={(v) => set("mantenimientoUltimo", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
          <Field flex={1}>
            <Label es="PRÓXIMO MANTENIMIENTO" lblEs={lblEs} />
            <TextInput
              value={data.mantenimientoProximo}
              onChangeText={(v) => set("mantenimientoProximo", v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <SectionBox colors={colors}>
        <Label es="OBSERVACIONES" lblEs={lblEs} />
        <TextInput
          value={data.observaciones}
          onChangeText={(v) => set("observaciones", v)}
          placeholder="—"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          style={multilineStyle}
          editable={!readonly}
        />
      </SectionBox>

      <SectionBox colors={colors}>
        <View style={styles.row}>
          <Field flex={1}>
            <Label es="FIRMA DEL PILOTO" lblEs={lblEs} />
            <TextInput
              value={data.firmaPiloto}
              onChangeText={(v) => set("firmaPiloto", v.toUpperCase())}
              placeholder="NOMBRE COMPLETO"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={inputStyle}
              editable={!readonly}
            />
          </Field>
        </View>
      </SectionBox>

      <View style={[styles.signArea, { borderColor: colors.border }]}>
        <Text style={[styles.signLabel, { color: colors.mutedForeground }]}>
          FIRMA Y SELLO / SIGN HERE
        </Text>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardFooterTxt, { color: colors.mutedForeground }]}>
          AeroUtil · Formulario Alfa · Declaración del Piloto
        </Text>
      </View>
    </View>
  );
}

export default function AlfaFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AlfaData>(BLANK);
  const [capturing, setCapturing] = useState(false);

  const shotFilled = useRef<ViewShot>(null);
  const shotBlank = useRef<ViewShot>(null);

  const set = <K extends keyof AlfaData>(key: K, val: AlfaData[K]) =>
    setData((p) => ({ ...p, [key]: val }));

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
          dialogTitle: "Compartir Formulario Alfa",
          UTI: "public.png",
        });
      } else {
        Alert.alert("Guardado", `Archivo en:\n${destFile.uri}`);
      }
    }
  };

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

  const downloadFilled = async () => {
    try {
      setCapturing(true);
      if (!shotFilled.current?.capture) throw new Error("ref no disponible");
      const uri = await shotFilled.current.capture();
      const filename = `ALFA_${data.matricula || "sin-matricula"}_${data.fecha || "sin-fecha"}.png`;
      await shareUri(uri, filename);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo generar la imagen del formulario.");
    } finally {
      setCapturing(false);
    }
  };

  const downloadBlank = async () => {
    try {
      setCapturing(true);
      if (!shotBlank.current?.capture) throw new Error("ref no disponible");
      const uri = await shotBlank.current.capture();
      await shareUri(uri, "ALFA_en-blanco.png");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo generar la imagen en blanco.");
    } finally {
      setCapturing(false);
    }
  };

  const printFilled = async () => {
    try {
      setCapturing(true);
      if (!shotFilled.current?.capture) throw new Error("ref no disponible");
      const uri = await shotFilled.current.capture();
      await printUri(uri, `Formulario Alfa - ${data.matricula || "Declaración"}`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo preparar la impresión.");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
      <View
        style={{ position: "absolute", top: -9999, left: 0, width: 390, opacity: 0, pointerEvents: "none" }}
      >
        <ViewShot
          ref={shotBlank}
          options={{ format: "png", quality: 1, result: "tmpfile" }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
        >
          <View style={[styles.cardHeader, { backgroundColor: colors.primary, borderTopLeftRadius: colors.radius, borderTopRightRadius: colors.radius }]}>
            <Text style={[styles.cardHeaderTxt, { color: colors.primaryForeground }]}>
              FORMULARIO ALFA
            </Text>
          </View>
          <AlfaFormContent data={BLANK} colors={colors} readonly />
        </ViewShot>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 160, paddingHorizontal: 14, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", paddingTop: 10 }}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            FORMULARIO ALFA
          </Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Declaración del piloto y aeronave · Completá, descargá, imprimí y compartí
          </Text>
        </View>

        <ViewShot
          ref={shotFilled}
          options={{ format: "png", quality: 1, result: "tmpfile" }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
        >
          <View style={[styles.cardHeader, { backgroundColor: colors.primary, borderTopLeftRadius: capturing ? 0 : colors.radius, borderTopRightRadius: capturing ? 0 : colors.radius }]}>
            <Text style={[styles.cardHeaderTxt, { color: colors.primaryForeground }]}>
              FORMULARIO ALFA
            </Text>
          </View>
          <AlfaFormContent data={data} colors={colors} onSet={set} />
        </ViewShot>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 14, backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => setData(BLANK)}
          style={({ pressed }) => [
            styles.btnOutline,
            { borderColor: colors.border, borderRadius: colors.radius - 6, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
          <Text style={[styles.btnOutlineTxt, { color: colors.foreground }]}>Limpiar</Text>
        </Pressable>

        <Pressable
          onPress={downloadBlank}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnOutline,
            { borderColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.45 : pressed ? 0.75 : 1 },
          ]}
        >
          <Feather name="file" size={15} color={colors.primary} />
          <Text style={[styles.btnOutlineTxt, { color: colors.primary }]}>En blanco</Text>
        </Pressable>

        <Pressable
          onPress={downloadFilled}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnSolid,
            { backgroundColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.45 : pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="download" size={15} color={colors.primaryForeground} />
          <Text style={[styles.btnSolidTxt, { color: colors.primaryForeground }]}>
            {capturing ? "Generando…" : "Descargar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={printFilled}
          disabled={capturing}
          style={({ pressed }) => [
            styles.btnOutline,
            { borderColor: colors.primary, borderRadius: colors.radius - 6, opacity: capturing ? 0.45 : pressed ? 0.75 : 1 },
          ]}
        >
          <Feather name="printer" size={15} color={colors.primary} />
          <Text style={[styles.btnOutlineTxt, { color: colors.primary }]}>Imprimir</Text>
        </Pressable>
      </View>
        </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
}

function SectionBox({ colors, children }: { colors: ReturnType<typeof useColors>; children: React.ReactNode }) {
  return (
    <View style={[styles.sectionBox, { borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
      {children}
    </View>
  );
}

function Label({ es, lblEs }: { es: string; lblEs: object[] }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={lblEs}>{es}</Text>
    </View>
  );
}

function Field({ flex, children }: { flex: number; children: React.ReactNode }) {
  return <View style={{ flex }}>{children}</View>;
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3, textAlign: "center" },
  pageSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3, textAlign: "center" },
  card: { borderWidth: 1, overflow: "hidden" },
  cardHeader: { padding: 14, alignItems: "center" },
  cardHeaderTxt: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1.4 },
  body: { padding: 14, gap: 10 },
  sectionBox: { borderWidth: 1, padding: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  labelEs: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" },
  input: { fontFamily: "Inter_500Medium", fontSize: 14, paddingHorizontal: 10, paddingVertical: 12, borderWidth: 1, marginTop: 2, minHeight: 44 },
  signArea: { borderWidth: 1, borderStyle: "dashed", borderRadius: 6, height: 70, justifyContent: "flex-end", alignItems: "center", paddingBottom: 8 },
  signLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },
  cardFooter: { borderTopWidth: 1, paddingTop: 10, alignItems: "center" },
  cardFooterTxt: { fontFamily: "Inter_400Regular", fontSize: 9 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 12, paddingBottom: 28, borderTopWidth: 1, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btnOutline: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, minHeight: 44 },
  btnOutlineTxt: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  btnSolid: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, minHeight: 44 },
  btnSolidTxt: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
