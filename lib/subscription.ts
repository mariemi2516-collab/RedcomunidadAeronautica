export type SubscriptionConfig = {
    cbu: string;
    cvu?: string;
    alias?: string;
    titular: string;
    cuit?: string;
    banco?: string;
    monthlyPriceArs?: number;
    yearlyPriceArs?: number;
    whatsappPhone?: string;
    whatsappMessage?: string;
  };

  export const subscription: SubscriptionConfig = {
    cbu: "",
    cvu: "",
    alias: "",
    titular: "",
    cuit: "",
    banco: "",
    monthlyPriceArs: undefined,
    yearlyPriceArs: undefined,
    whatsappPhone: "",
    whatsappMessage:
      "Hola, te envío el comprobante de mi suscripción a AeroAR · Mi Aeroclub.",
  };
  