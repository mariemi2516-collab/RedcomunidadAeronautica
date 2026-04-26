export type ExternalLink = {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
  /** If set, navigate to this internal route instead of opening the URL. */
  route?: string;
};

export type LinkSection = {
  title: string;
  description?: string;
  items: ExternalLink[];
};

export const planificacionLinks: LinkSection[] = [
  {
    title: "Plan de vuelo",
    description: "Presentación del FPL electrónico",
    items: [
      {
        id: "fpl-form",
        title: "Plan de vuelo — Formulario ICAO",
        subtitle: "Completá, descargá en blanco o con datos",
        url: "",
        route: "/fpl-form",
        badge: "Editable",
      },
      {
        id: "eana-fpl",
        title: "EANA — Plan de Vuelo Electrónico",
        subtitle: "Servicios EANA",
        url: "https://www.eana.com.ar/servicios",
        badge: "Oficial",
      },
      {
        id: "aip",
        title: "AIP Argentina",
        subtitle: "Cartas, manuales y publicación aeronáutica",
        url: "https://ais.anac.gob.ar/aip",
        badge: "Oficial",
      },
    ],
  },
  {
    title: "Trámites y licencias",
    items: [
      {
        id: "anac-cad",
        title: "ANAC — CAD",
        subtitle: "Licencias, CMA y certificaciones",
        url: "https://www.argentina.gob.ar/anac",
        badge: "Oficial",
      },
      {
        id: "vua",
        title: "VUA — Ventanilla Única Aeronáutica",
        subtitle: "Trámites online ANAC",
        url: "https://www.argentina.gob.ar/anac/tramites",
        badge: "Oficial",
      },
    ],
  },
];

export const meteorologiaLinks: LinkSection[] = [
  {
    title: "Información oficial",
    items: [
      {
        id: "smn",
        title: "SMN Aeronáutica",
        subtitle: "METAR · TAF · SIGMET",
        url: "https://www.smn.gob.ar/aeronautica",
        badge: "SMN",
      },
      {
        id: "smn-pronos",
        title: "SMN — Pronóstico aeronáutico",
        subtitle: "Argentina y región",
        url: "https://www.smn.gob.ar/",
      },
    ],
  },
  {
    title: "Modelos y satélite",
    items: [
      {
        id: "windy",
        title: "Windy.com",
        subtitle: "ECMWF · GFS · radar",
        url: "https://www.windy.com/?-34.6,-58.4,7",
      },
      {
        id: "goes",
        title: "GOES-16 — Satélite",
        subtitle: "Imágenes infrarrojo / vapor de agua",
        url: "https://www.star.nesdis.noaa.gov/goes/sector.php?sat=G16&sector=ssa",
      },
      {
        id: "rem",
        title: "Estaciones REM",
        subtitle: "Red de estaciones meteorológicas",
        url: "https://ssd.smn.gob.ar/",
      },
    ],
  },
];

export const traficoLinks: LinkSection[] = [
  {
    title: "Tráfico en vivo",
    items: [
      {
        id: "fr24",
        title: "FlightRadar24",
        subtitle: "Tráfico comercial en tiempo real",
        url: "https://www.flightradar24.com/",
      },
      {
        id: "adsbex",
        title: "ADS-B Exchange",
        subtitle: "Tráfico sin filtros (incluye militar)",
        url: "https://globe.adsbexchange.com/",
      },
    ],
  },
];

export const aeropuertosLinks: LinkSection[] = [
  {
    title: "Información de aeródromos",
    items: [
      {
        id: "ifis",
        title: "IFIS — EANA",
        subtitle: "Información integrada de vuelo",
        url: "https://ais.anac.gob.ar/",
        badge: "Oficial",
      },
      {
        id: "aerolink",
        title: "MADHEL — Aeródromos AR",
        subtitle: "Manual de aeródromos y helipuertos",
        url: "https://ais.anac.gob.ar/madhel/",
      },
      {
        id: "skyvector",
        title: "SkyVector",
        subtitle: "Cartas mundiales y planificación",
        url: "https://skyvector.com/",
      },
    ],
  },
];

export const bibliotecaLinks: LinkSection[] = [
  {
    title: "Normativa",
    items: [
      {
        id: "raac",
        title: "RAAC — Reglamento Argentino",
        subtitle: "Aviación civil",
        url: "https://www.argentina.gob.ar/anac/raac-dnar-regulaciones-argentinas-de-aviacion-civil/raac",
        badge: "ANAC",
      },
      {
        id: "anac-norm",
        title: "ANAC — Normativa",
        subtitle: "Resoluciones y disposiciones",
        url: "https://www.argentina.gob.ar/anac/normativa",
        badge: "ANAC",
      },
    ],
  },
  {
    title: "Seguridad operacional",
    items: [
      {
        id: "jst",
        title: "JST — Junta de Seguridad",
        subtitle: "Informes de incidentes y accidentes",
        url: "https://www.argentina.gob.ar/jst",
        badge: "JST",
      },
    ],
  },
];

export const comercialesLinks: LinkSection[] = [
  {
    title: "Aeropuertos y aerolíneas",
    items: [
      {
        id: "aa2000",
        title: "Aeropuertos Argentina 2000",
        subtitle: "Estado de vuelos · servicios",
        url: "https://www.aa2000.com.ar/",
      },
      {
        id: "ar",
        title: "Aerolíneas Argentinas",
        url: "https://www.aerolineas.com.ar/es-us/chequea-el-estado-de-tu-reserva-y-vuelo",
      },
      {
        id: "fb",
        title: "Flybondi",
        url: "https://www.flybondi.com/ar",
      },
      {
        id: "js",
        title: "JetSmart",
        url: "https://jetsmart.com/ar/es/",
      },
      {
        id: "fa",
        title: "FlightAware",
        subtitle: "Seguimiento de vuelos en vivo",
        url: "https://flightaware.com/",
      },
    ],
  },
];

export const directorioCategorias = [
  { id: "combustible", label: "Combustible (AVGAS / JET A1)" },
  { id: "talleres", label: "Talleres aeronáuticos" },
  { id: "alojamiento", label: "Alojamiento cercano a AD" },
] as const;

export type DirectorioCategoria = (typeof directorioCategorias)[number]["id"];

export const directorioItems: Record<
  DirectorioCategoria,
  { id: string; nombre: string; ubicacion: string; contacto: string }[]
> = {
  combustible: [
    {
      id: "aep",
      nombre: "AA2000 — AEP Aeroparque",
      ubicacion: "CABA",
      contacto: "+54 11 5480-6111",
    },
    {
      id: "san-fernando",
      nombre: "SAFB San Fernando — Servicios FBO",
      ubicacion: "San Fernando, BA",
      contacto: "+54 11 4744-2900",
    },
    {
      id: "morón",
      nombre: "Aeroclub Argentino — Morón",
      ubicacion: "Morón, BA",
      contacto: "+54 11 4628-1284",
    },
  ],
  talleres: [
    {
      id: "tar-1",
      nombre: "TAR — Taller Aeronáutico habilitado",
      ubicacion: "San Fernando",
      contacto: "Consultar listado ANAC",
    },
    {
      id: "tar-2",
      nombre: "Mantenimiento Cessna / Piper",
      ubicacion: "Morón / La Plata",
      contacto: "Consultar listado ANAC",
    },
  ],
  alojamiento: [
    {
      id: "host-1",
      nombre: "Hospedaje cercano AD San Fernando",
      ubicacion: "Tigre, BA",
      contacto: "Consultar reservas",
    },
    {
      id: "host-2",
      nombre: "Hostería Aeroclub Bariloche",
      ubicacion: "Bariloche, RN",
      contacto: "Consultar reservas",
    },
  ],
};
