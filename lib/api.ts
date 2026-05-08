import Constants from "expo-constants";
import { Platform } from "react-native";

import { STORAGE_KEYS, loadJSON } from "./storage";
import type {
  ApiAerodromo,
  ApiCommunityPost,
  ApiFlight,
  ApiFlightProgress,
  ApiFlightSettings,
  ApiPlatformConfig,
  ApiSession,
  ApiSubscription,
  ApiUser,
  ApiVencimiento,
} from "./types";

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function readEnvBaseUrl(): string | undefined {
  const fromExpo = (Constants?.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
    ?.apiBaseUrl;
  if (fromExpo && typeof fromExpo === "string") return fromExpo;
  const fromProcess =
    typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_BASE_URL : undefined;
  if (fromProcess && typeof fromProcess === "string") return fromProcess;
  return undefined;
}

function defaultBaseUrl(): string {
  const env = readEnvBaseUrl();
  if (env) return env.replace(/\/$/, "");
 return "https://aero-4iiv.onrender.com";
}

let cachedBase: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBase) return cachedBase;
  const stored = await loadJSON<string>(STORAGE_KEYS.apiBaseUrl, "");
  cachedBase = (stored && stored.trim()) || defaultBaseUrl();
  return cachedBase;
}

export function setApiBaseUrlCache(value: string) {
  cachedBase = value.replace(/\/$/, "");
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Json;
  token?: string | null;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const base = await getApiBaseUrl();
  const url = `${base}/api${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body,
      signal: opts.signal,
    });
  } catch (err) {
  throw new ApiError(
    err instanceof Error ? err.message : "Error de red",
    0,
    err,
  );
}
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: unknown }).error ?? "")
        : "") || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

export const api = {
  setBaseUrlCache: setApiBaseUrlCache,
  getBaseUrl: getApiBaseUrl,

  config(): Promise<ApiPlatformConfig> {
    return apiRequest<ApiPlatformConfig>("/config");
  },
  health(): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>("/health");
  },

  // auth
  login(email: string, password: string): Promise<ApiSession> {
    return apiRequest<ApiSession>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  register(input: {
    email: string;
    password: string;
    name: string;
    role: "piloto" | "aerodromo";
  }): Promise<ApiSession> {
    return apiRequest<ApiSession>("/auth/register", {
      method: "POST",
      body: input,
    });
  },
  me(token: string): Promise<{ user: ApiUser; subscription: ApiSubscription }> {
    return apiRequest("/auth/me", { token });
  },

  // subscription
  subscriptionStatus(token: string): Promise<ApiSubscription> {
    return apiRequest("/subscriptions/me", { token });
  },
  subscriptionActivate(token: string, paymentRef?: string): Promise<ApiSubscription> {
    return apiRequest("/subscriptions/activate", {
      method: "POST",
      token,
      body: { paymentRef },
    });
  },
  subscriptionCancel(token: string): Promise<ApiSubscription> {
    return apiRequest("/subscriptions/cancel", { method: "POST", token });
  },

  // aerodromos
  aerodromosList(token: string): Promise<ApiAerodromo[]> {
    return apiRequest("/aerodromos", { token });
  },
  aerodromoMine(token: string): Promise<ApiAerodromo | null> {
    return apiRequest("/aerodromos/me", { token });
  },
  aerodromoUpsert(token: string, payload: Partial<ApiAerodromo>): Promise<ApiAerodromo> {
    return apiRequest("/aerodromos/me", { method: "PUT", token, body: payload });
  },

  // vencimientos
  vencimientosList(token: string): Promise<ApiVencimiento[]> {
    return apiRequest("/vencimientos", { token });
  },
  vencimientoCreate(
    token: string,
    payload: { titulo: string; tipo: ApiVencimiento["tipo"]; fechaVencimiento: string; notas?: string },
  ): Promise<ApiVencimiento> {
    return apiRequest("/vencimientos", { method: "POST", token, body: payload });
  },
  vencimientoRemove(token: string, id: string): Promise<void> {
    return apiRequest(`/vencimientos/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    });
  },

  // flights
  flightsList(token: string): Promise<ApiFlight[]> {
    return apiRequest("/flights", { token });
  },
  flightCreate(
    token: string,
    payload: {
      fecha: string;
      matricula: string;
      origen: string;
      destino: string;
      duracionMin: number;
      tipoVuelo: ApiFlight["tipoVuelo"];
      observaciones?: string;
    },
  ): Promise<ApiFlight> {
    return apiRequest("/flights", { method: "POST", token, body: payload });
  },
  flightRemove(token: string, id: string): Promise<void> {
    return apiRequest(`/flights/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    });
  },
  flightSettings(token: string): Promise<ApiFlightSettings> {
    return apiRequest("/flights/settings", { token });
  },
  flightUpdateSettings(token: string, pricePerHourUsd: number): Promise<ApiFlightSettings> {
    return apiRequest("/flights/settings", {
      method: "PUT",
      token,
      body: { pricePerHourUsd },
    });
  },
  flightProgress(token: string): Promise<ApiFlightProgress> {
    return apiRequest("/flights/progress", { token });
  },

  // community
  communityList(): Promise<ApiCommunityPost[]> {
    return apiRequest("/community");
  },
  communityCreate(
    token: string,
    payload: { text: string; imageDataUrl?: string },
  ): Promise<ApiCommunityPost> {
    return apiRequest("/community", { method: "POST", token, body: payload });
  },
  communityRemove(token: string, id: string): Promise<void> {
    return apiRequest(`/community/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    });
  },
  communityToggleLike(token: string, id: string): Promise<ApiCommunityPost> {
    return apiRequest(`/community/${encodeURIComponent(id)}/like`, {
      method: "POST",
      token,
    });
  },
};
