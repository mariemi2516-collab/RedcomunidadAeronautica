export type AdLinkConfig =
    | { type: "url"; href: string }
    | { type: "whatsapp"; phone: string; message?: string };

  export type AdConfig = {
    enabled: boolean;
    image: number | null;
    title?: string;
    subtitle?: string;
    link: AdLinkConfig;
  };

  export const dashboardAd: AdConfig = {
    enabled: false,
    image: null,
    title: undefined,
    subtitle: undefined,
    link: { type: "url", href: "https://" },
  };
  