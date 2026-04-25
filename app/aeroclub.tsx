import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppData } from "@/contexts/AppDataContext";
import { useColors } from "@/hooks/useColors";

type Section = "vencimientos" | "novedades" | "reservas";

const SECTIONS: { id: Section; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "vencimientos", label: "Vencimientos", icon: "calendar" },
  { id: "novedades", label: "Novedades", icon: "tool" },
  { id: "reservas", label: "Reservas", icon: "key" },
];

export default function AeroclubScreen() {
  const colors = useColors();
  const [active, setActive] = useState<Section>("vencimientos");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.tabs,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <Pressable
              key={s.id}
              onPress={() => setActive(s.id)}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : "transparent",
                  borderRadius: colors.radius - 4,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather
                name={s.icon}
                size={14}
                color={isActive ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {active === "vencimientos" ? <VencimientosTab /> : null}
        {active === "novedades" ? <NovedadesTab /> : null}
        {active === "reservas" ? <ReservasTab /> : null}
      </ScrollView>
    </View>
  );
}

function VencimientosTab() {
  const colors = useColors();
  const { vencimientos, addVencimiento, removeVencimiento } = useAppData();
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"CMA" | "Licencia" | "Seguro" | "Habilitación" | "Otro">("CMA");
  const [fecha, setFecha] = useState("");

  return (
    <View style={{ gap: 14 }}>
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.formTitle, { color: colors.foreground }]}>
          Nuevo vencimiento
        </Text>
        <FormField
          label="Título"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej. CMA Clase 2"
        />
        <View>
          <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>
            TIPO
          </Text>
          <View style={styles.chipRow}>
            {(["CMA", "Licencia", "Seguro", "Habilitación", "Otro"] as const).map(
              (t) => (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor:
                        tipo === t ? colors.primary : colors.secondary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          tipo === t
                            ? colors.primaryForeground
                            : colors.foreground,
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
        </View>
        <FormField
          label="Fecha de vencimiento"
          value={fecha}
          onChangeText={setFecha}
          placeholder="AAAA-MM-DD"
        />
        <PrimaryButton
          label="Agregar"
          icon="plus"
          full
          onPress={async () => {
            if (!titulo.trim() || !fecha.trim()) return;
            await addVencimiento({
              titulo: titulo.trim(),
              tipo,
              fechaVencimiento: fecha.trim(),
            });
            setTitulo("");
            setFecha("");
          }}
        />
      </View>

      {vencimientos.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Sin vencimientos cargados"
          description="Cargá CMA, licencias, seguros y habilitaciones para recibir alertas visuales."
        />
      ) : (
        vencimientos.map((v) => {
          const days = Math.round(
            (new Date(v.fechaVencimiento).getTime() - Date.now()) / 86400000,
          );
          const tint =
            days < 0
              ? colors.destructive
              : days <= 30
                ? colors.warning
                : colors.success;
          return (
            <View
              key={v.id}
              style={[
                styles.itemRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <View
                style={[
                  styles.itemDot,
                  { backgroundColor: tint, borderRadius: 4 },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]}>
                  {v.titulo}
                </Text>
                <Text
                  style={[styles.itemSub, { color: colors.mutedForeground }]}
                >
                  {v.tipo} · {v.fechaVencimiento}
                </Text>
              </View>
              <Text style={[styles.daysText, { color: tint }]}>
                {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
              </Text>
              <Pressable
                onPress={() => removeVencimiento(v.id)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

function NovedadesTab() {
  const colors = useColors();
  const { novedades, addNovedad, toggleNovedad, removeNovedad } = useAppData();
  const [matricula, setMatricula] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  return (
    <View style={{ gap: 14 }}>
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.formTitle, { color: colors.foreground }]}>
          Nueva novedad técnica
        </Text>
        <FormField
          label="Matrícula"
          value={matricula}
          onChangeText={(t) => setMatricula(t.toUpperCase())}
          placeholder="LV-XXX"
        />
        <FormField
          label="Fecha"
          value={fecha}
          onChangeText={setFecha}
          placeholder="AAAA-MM-DD"
        />
        <FormField
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Detalle de la novedad"
          multiline
          numberOfLines={3}
        />
        <PrimaryButton
          label="Registrar novedad"
          icon="plus"
          full
          onPress={async () => {
            if (!matricula.trim() || !descripcion.trim() || !fecha.trim()) return;
            await addNovedad({
              matricula: matricula.trim(),
              descripcion: descripcion.trim(),
              fecha: fecha.trim(),
              estado: "Abierta",
            });
            setMatricula("");
            setDescripcion("");
            setFecha("");
          }}
        />
      </View>

      {novedades.length === 0 ? (
        <EmptyState
          icon="tool"
          title="Libro técnico vacío"
          description="Registrá fallas, observaciones y trabajos pendientes."
        />
      ) : (
        novedades.map((n) => {
          const tint = n.estado === "Abierta" ? colors.warning : colors.success;
          return (
            <View
              key={n.id}
              style={[
                styles.novedadCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <View style={styles.novedadHeader}>
                <View
                  style={[
                    styles.estadoChip,
                    { backgroundColor: tint + "26" },
                  ]}
                >
                  <Text style={[styles.estadoText, { color: tint }]}>
                    {n.estado.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.matText, { color: colors.foreground }]}>
                  {n.matricula}
                </Text>
                <Text style={[styles.fechaText, { color: colors.mutedForeground }]}>
                  {n.fecha}
                </Text>
              </View>
              <Text style={[styles.descText, { color: colors.foreground }]}>
                {n.descripcion}
              </Text>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => toggleNovedad(n.id)}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    {
                      backgroundColor: colors.secondary,
                      borderRadius: 8,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={n.estado === "Abierta" ? "check" : "rotate-ccw"}
                    size={12}
                    color={colors.foreground}
                  />
                  <Text
                    style={[styles.smallBtnText, { color: colors.foreground }]}
                  >
                    {n.estado === "Abierta" ? "Resolver" : "Reabrir"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => removeNovedad(n.id)}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    {
                      backgroundColor: "transparent",
                      borderRadius: 8,
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={12} color={colors.mutedForeground} />
                  <Text
                    style={[
                      styles.smallBtnText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Eliminar
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function ReservasTab() {
  const colors = useColors();
  const { reservas, addReserva, removeReserva } = useAppData();
  const [matricula, setMatricula] = useState("");
  const [piloto, setPiloto] = useState("");
  const [fecha, setFecha] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  return (
    <View style={{ gap: 14 }}>
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Text style={[styles.formTitle, { color: colors.foreground }]}>
          Reservar aeronave
        </Text>
        <FormField
          label="Matrícula"
          value={matricula}
          onChangeText={(t) => setMatricula(t.toUpperCase())}
          placeholder="LV-XXX"
        />
        <FormField
          label="Piloto"
          value={piloto}
          onChangeText={setPiloto}
          placeholder="Nombre"
        />
        <FormField
          label="Fecha"
          value={fecha}
          onChangeText={setFecha}
          placeholder="AAAA-MM-DD"
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <FormField
              label="Desde"
              value={desde}
              onChangeText={setDesde}
              placeholder="HH:MM"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Hasta"
              value={hasta}
              onChangeText={setHasta}
              placeholder="HH:MM"
            />
          </View>
        </View>
        <PrimaryButton
          label="Reservar"
          icon="plus"
          full
          onPress={async () => {
            if (
              !matricula.trim() ||
              !piloto.trim() ||
              !fecha.trim() ||
              !desde.trim() ||
              !hasta.trim()
            )
              return;
            await addReserva({
              matricula: matricula.trim(),
              piloto: piloto.trim(),
              fecha: fecha.trim(),
              desde: desde.trim(),
              hasta: hasta.trim(),
            });
            setMatricula("");
            setPiloto("");
            setFecha("");
            setDesde("");
            setHasta("");
          }}
        />
      </View>

      {reservas.length === 0 ? (
        <EmptyState
          icon="key"
          title="Sin reservas activas"
          description="El calendario compartido se mantiene en tu dispositivo."
        />
      ) : (
        reservas.map((r) => (
          <View
            key={r.id}
            style={[
              styles.itemRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius - 2,
              },
            ]}
          >
            <View
              style={[
                styles.itemDot,
                { backgroundColor: colors.accent, borderRadius: 4 },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>
                {r.matricula} · {r.piloto}
              </Text>
              <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>
                {r.fecha} · {r.desde}–{r.hasta}
              </Text>
            </View>
            <Pressable
              onPress={() => removeReserva(r.id)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    margin: 20,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  formCard: { padding: 16, borderWidth: 1, gap: 12 },
  formTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  smallLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  itemDot: { width: 4, height: 30 },
  itemTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  itemSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  daysText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  iconBtn: { padding: 6 },
  novedadCard: { padding: 14, gap: 10, borderWidth: 1 },
  novedadHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  estadoChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  estadoText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  matText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  fechaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginLeft: "auto",
  },
  descText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
  },
  actionsRow: { flexDirection: "row", gap: 8 },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
