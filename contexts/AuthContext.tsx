import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, ApiError } from "@/lib/api";
import { STORAGE_KEYS, loadJSON, saveJSON } from "@/lib/storage";
import type {
  ApiPlatformConfig,
  ApiSession,
  ApiSubscription,
  ApiUser,
} from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Status = "loading" | "anonymous" | "authenticated";

type AuthContextValue = {
  status: Status;
  user: ApiUser | null;
  token: string | null;
  subscription: ApiSubscription | null;
  config: ApiPlatformConfig | null;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  login: (email: string, password: string) => Promise<ApiSession>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    role: "piloto" | "aerodromo";
  }) => Promise<ApiSession>;
  activateSubscription: (paymentRef?: string) => Promise<ApiSubscription>;
  cancelSubscription: () => Promise<ApiSubscription>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [config, setConfig] = useState<ApiPlatformConfig | null>(null);

  const persistSession = useCallback(
    async (session: ApiSession | null) => {
      if (!session) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.authToken,
          STORAGE_KEYS.authUser,
        ]);
        return;
      }
      await saveJSON(STORAGE_KEYS.authToken, session.token);
      await saveJSON(STORAGE_KEYS.authUser, session.user);
    },
    [],
  );

  const applySession = useCallback((session: ApiSession) => {
    setToken(session.token);
    setUser(session.user);
    setSubscription(session.subscription);
    setStatus("authenticated");
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      const c = await api.config();
      setConfig(c);
    } catch {
      // sin red: lo intentamos otra vez al loguear o al activar
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!token) return;
    try {
      const sub = await api.subscriptionStatus(token);
      setSubscription(sub);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // token expirado
        setToken(null);
        setUser(null);
        setSubscription(null);
        setStatus("anonymous");
        await persistSession(null);
      }
    }
  }, [token, persistSession]);

  // hidratar sesión guardada
  useEffect(() => {
    (async () => {
      const [t, u] = await Promise.all([
        loadJSON<string>(STORAGE_KEYS.authToken, ""),
        loadJSON<ApiUser | null>(STORAGE_KEYS.authUser, null),
      ]);
      if (t && u) {
        setToken(t);
        setUser(u);
        try {
          const me = await api.me(t);
          setUser(me.user);
          setSubscription(me.subscription);
          setStatus("authenticated");
        } catch {
          // limpiamos sesión inválida
          setToken(null);
          setUser(null);
          setSubscription(null);
          setStatus("anonymous");
          await persistSession(null);
        }
      } else {
        setStatus("anonymous");
      }
      refreshConfig();
    })();
  }, [persistSession, refreshConfig]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api.login(email, password);
      await persistSession(session);
      applySession(session);
      return session;
    },
    [applySession, persistSession],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      role: "piloto" | "aerodromo";
    }) => {
      const session = await api.register(input);
      await persistSession(session);
      applySession(session);
      return session;
    },
    [applySession, persistSession],
  );

  const activateSubscription = useCallback(
    async (paymentRef?: string) => {
      if (!token) throw new ApiError("Sin sesión", 401);
      const sub = await api.subscriptionActivate(token, paymentRef);
      setSubscription(sub);
      return sub;
    },
    [token],
  );

  const cancelSubscription = useCallback(async () => {
    if (!token) throw new ApiError("Sin sesión", 401);
    const sub = await api.subscriptionCancel(token);
    setSubscription(sub);
    return sub;
  }, [token]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setSubscription(null);
    setStatus("anonymous");
    await persistSession(null);
  }, [persistSession]);

  const hasActiveSubscription = !!subscription?.active;

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      subscription,
      config,
      hasActiveSubscription,
      refreshSubscription,
      refreshConfig,
      login,
      register,
      activateSubscription,
      cancelSubscription,
      logout,
    }),
    [
      status,
      user,
      token,
      subscription,
      config,
      hasActiveSubscription,
      refreshSubscription,
      refreshConfig,
      login,
      register,
      activateSubscription,
      cancelSubscription,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
