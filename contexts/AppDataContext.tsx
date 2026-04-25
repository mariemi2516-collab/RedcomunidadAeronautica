import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS, loadJSON, saveJSON, uid } from "@/lib/storage";
import type {
  BitacoraEntry,
  NovedadTecnica,
  PilotProfile,
  Reserva,
  SosContact,
  Vencimiento,
} from "@/lib/types";

type AppDataContextValue = {
  ready: boolean;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => Promise<void>;

  bitacora: BitacoraEntry[];
  addBitacora: (entry: Omit<BitacoraEntry, "id">) => Promise<void>;
  removeBitacora: (id: string) => Promise<void>;
  totalHorasMin: number;

  novedades: NovedadTecnica[];
  addNovedad: (entry: Omit<NovedadTecnica, "id">) => Promise<void>;
  toggleNovedad: (id: string) => Promise<void>;
  removeNovedad: (id: string) => Promise<void>;

  vencimientos: Vencimiento[];
  addVencimiento: (entry: Omit<Vencimiento, "id">) => Promise<void>;
  removeVencimiento: (id: string) => Promise<void>;

  reservas: Reserva[];
  addReserva: (entry: Omit<Reserva, "id">) => Promise<void>;
  removeReserva: (id: string) => Promise<void>;

  sosContacts: SosContact[];
  addSosContact: (entry: Omit<SosContact, "id">) => Promise<void>;
  removeSosContact: (id: string) => Promise<void>;

  pilot: PilotProfile;
  updatePilot: (entry: PilotProfile) => Promise<void>;
};

const defaultPilot: PilotProfile = {
  nombre: "",
  matriculaPiloto: "",
  aeronavePredeterminada: "",
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([]);
  const [novedades, setNovedades] = useState<NovedadTecnica[]>([]);
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [sosContacts, setSosContacts] = useState<SosContact[]>([]);
  const [pilot, setPilot] = useState<PilotProfile>(defaultPilot);

  useEffect(() => {
    (async () => {
      const [d, b, n, v, r, s, p] = await Promise.all([
        loadJSON<boolean>(STORAGE_KEYS.disclaimerAccepted, false),
        loadJSON<BitacoraEntry[]>(STORAGE_KEYS.bitacora, []),
        loadJSON<NovedadTecnica[]>(STORAGE_KEYS.novedades, []),
        loadJSON<Vencimiento[]>(STORAGE_KEYS.vencimientos, []),
        loadJSON<Reserva[]>(STORAGE_KEYS.reservas, []),
        loadJSON<SosContact[]>(STORAGE_KEYS.sosContacts, []),
        loadJSON<PilotProfile>(STORAGE_KEYS.pilotProfile, defaultPilot),
      ]);
      setDisclaimerAccepted(d);
      setBitacora(b);
      setNovedades(n);
      setVencimientos(v);
      setReservas(r);
      setSosContacts(s);
      setPilot(p);
      setReady(true);
    })();
  }, []);

  const acceptDisclaimer = useCallback(async () => {
    setDisclaimerAccepted(true);
    await saveJSON(STORAGE_KEYS.disclaimerAccepted, true);
  }, []);

  const addBitacora = useCallback(
    async (entry: Omit<BitacoraEntry, "id">) => {
      const next = [{ ...entry, id: uid() }, ...bitacora];
      setBitacora(next);
      await saveJSON(STORAGE_KEYS.bitacora, next);
    },
    [bitacora],
  );

  const removeBitacora = useCallback(
    async (id: string) => {
      const next = bitacora.filter((e) => e.id !== id);
      setBitacora(next);
      await saveJSON(STORAGE_KEYS.bitacora, next);
    },
    [bitacora],
  );

  const totalHorasMin = useMemo(
    () => bitacora.reduce((acc, e) => acc + e.duracionMin, 0),
    [bitacora],
  );

  const addNovedad = useCallback(
    async (entry: Omit<NovedadTecnica, "id">) => {
      const next = [{ ...entry, id: uid() }, ...novedades];
      setNovedades(next);
      await saveJSON(STORAGE_KEYS.novedades, next);
    },
    [novedades],
  );

  const toggleNovedad = useCallback(
    async (id: string) => {
      const next = novedades.map((n) =>
        n.id === id
          ? { ...n, estado: n.estado === "Abierta" ? "Resuelta" : "Abierta" }
          : n,
      ) as NovedadTecnica[];
      setNovedades(next);
      await saveJSON(STORAGE_KEYS.novedades, next);
    },
    [novedades],
  );

  const removeNovedad = useCallback(
    async (id: string) => {
      const next = novedades.filter((n) => n.id !== id);
      setNovedades(next);
      await saveJSON(STORAGE_KEYS.novedades, next);
    },
    [novedades],
  );

  const addVencimiento = useCallback(
    async (entry: Omit<Vencimiento, "id">) => {
      const next = [{ ...entry, id: uid() }, ...vencimientos];
      setVencimientos(next);
      await saveJSON(STORAGE_KEYS.vencimientos, next);
    },
    [vencimientos],
  );

  const removeVencimiento = useCallback(
    async (id: string) => {
      const next = vencimientos.filter((e) => e.id !== id);
      setVencimientos(next);
      await saveJSON(STORAGE_KEYS.vencimientos, next);
    },
    [vencimientos],
  );

  const addReserva = useCallback(
    async (entry: Omit<Reserva, "id">) => {
      const next = [{ ...entry, id: uid() }, ...reservas];
      setReservas(next);
      await saveJSON(STORAGE_KEYS.reservas, next);
    },
    [reservas],
  );

  const removeReserva = useCallback(
    async (id: string) => {
      const next = reservas.filter((e) => e.id !== id);
      setReservas(next);
      await saveJSON(STORAGE_KEYS.reservas, next);
    },
    [reservas],
  );

  const addSosContact = useCallback(
    async (entry: Omit<SosContact, "id">) => {
      const next = [...sosContacts, { ...entry, id: uid() }];
      setSosContacts(next);
      await saveJSON(STORAGE_KEYS.sosContacts, next);
    },
    [sosContacts],
  );

  const removeSosContact = useCallback(
    async (id: string) => {
      const next = sosContacts.filter((e) => e.id !== id);
      setSosContacts(next);
      await saveJSON(STORAGE_KEYS.sosContacts, next);
    },
    [sosContacts],
  );

  const updatePilot = useCallback(async (entry: PilotProfile) => {
    setPilot(entry);
    await saveJSON(STORAGE_KEYS.pilotProfile, entry);
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      disclaimerAccepted,
      acceptDisclaimer,
      bitacora,
      addBitacora,
      removeBitacora,
      totalHorasMin,
      novedades,
      addNovedad,
      toggleNovedad,
      removeNovedad,
      vencimientos,
      addVencimiento,
      removeVencimiento,
      reservas,
      addReserva,
      removeReserva,
      sosContacts,
      addSosContact,
      removeSosContact,
      pilot,
      updatePilot,
    }),
    [
      ready,
      disclaimerAccepted,
      acceptDisclaimer,
      bitacora,
      addBitacora,
      removeBitacora,
      totalHorasMin,
      novedades,
      addNovedad,
      toggleNovedad,
      removeNovedad,
      vencimientos,
      addVencimiento,
      removeVencimiento,
      reservas,
      addReserva,
      removeReserva,
      sosContacts,
      addSosContact,
      removeSosContact,
      pilot,
      updatePilot,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
