import { router } from "expo-router";
import React, { useEffect } from "react";

import { Paywall } from "@/components/Paywall";
import { useAuth } from "@/contexts/AuthContext";

export default function AeroclubPaywallScreen() {
  const { status, hasActiveSubscription } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && hasActiveSubscription) {
      router.replace("/aeroclub");
    }
  }, [status, hasActiveSubscription]);

  return (
    <Paywall
      reason="Mis Vencimientos forma parte del paquete premium de la red. Iniciá sesión y activá la suscripción mensual para gestionar CMA, licencias, seguros y habilitaciones."
      ctaLabel="Acceso premium"
    />
  );
}
