import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  disclaimerAccepted: "@aeroar/disclaimer-v1",
  bitacora: "@aeroar/bitacora",
  novedades: "@aeroar/novedades",
  vencimientos: "@aeroar/vencimientos",
  reservas: "@aeroar/reservas",
  sosContacts: "@aeroar/sos-contacts",
  pilotProfile: "@aeroar/pilot-profile",
  metarFavs: "@aeroar/metar-favoritos",
} as const;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
