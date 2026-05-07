export type BitacoraEntry = {
  id: string;
  fecha: string;
  matricula: string;
  origen: string;
  destino: string;
  duracionMin: number;
  tipoVuelo: "Local" | "Travesía" | "Instrucción" | "Trabajo aéreo";
  observaciones?: string;
};

export type NovedadTecnica = {
  id: string;
  fecha: string;
  matricula: string;
  descripcion: string;
  estado: "Abierta" | "Resuelta";
};

export type Vencimiento = {
  id: string;
  titulo: string;
  tipo: "CMA" | "Licencia" | "Seguro" | "Habilitación" | "Otro";
  fechaVencimiento: string;
};

export type Reserva = {
  id: string;
  matricula: string;
  piloto: string;
  fecha: string;
  desde: string;
  hasta: string;
  proposito?: string;
};

export type SosContact = {
  id: string;
  nombre: string;
  telefono: string;
};

export type PilotProfile = {
  nombre: string;
  matriculaPiloto: string;
  aeronavePredeterminada: string;
};

// ----- Comunidad / API types -----

export type ApiUserRole = "piloto" | "aerodromo";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: ApiUserRole;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
};

export type ApiSubscription = {
  userId: string;
  active: boolean;
  priceUsd: number;
  startedAt?: string;
  expiresAt?: string;
  paymentRef?: string;
};

export type ApiSession = {
  user: ApiUser;
  token: string;
  subscription: ApiSubscription;
};

export type ApiAerodromo = {
  id: string;
  ownerId: string;
  nombre: string;
  icao?: string;
  ciudad?: string;
  provincia?: string;
  pista?: string;
  frecuencia?: string;
  contacto?: string;
  descripcion?: string;
  fotoUrl?: string;
  updatedAt: string;
};

export type ApiVencimiento = {
  id: string;
  userId: string;
  titulo: string;
  tipo: "CMA" | "Licencia" | "Seguro" | "Habilitacion" | "Otro";
  fechaVencimiento: string;
  notas?: string;
  createdAt: string;
};

export type ApiFlight = {
  id: string;
  userId: string;
  fecha: string;
  matricula: string;
  origen: string;
  destino: string;
  duracionMin: number;
  tipoVuelo: "Local" | "Travesia" | "Instruccion" | "Trabajo aereo";
  observaciones?: string;
  costoUsd: number;
  createdAt: string;
};

export type ApiFlightSettings = {
  userId: string;
  pricePerHourUsd: number;
  updatedAt: string;
};

export type ApiFlightProgress = {
  totalCourseHours: number;
  pricePerHourUsd: number;
  flownMinutes: number;
  flownHours: number;
  remainingMinutes: number;
  remainingHours: number;
  totalCostUsd: number;
  spentCostUsd: number;
  remainingCostUsd: number;
  percentage: number;
};

export type ApiCommunityAuthor = {
  id: string;
  name: string;
  role: ApiUserRole;
  avatarUrl?: string;
};

export type ApiCommunityPost = {
  id: string;
  authorId: string;
  text: string;
  imageDataUrl?: string;
  createdAt: string;
  likes: string[];
  author: ApiCommunityAuthor | null;
};

export type ApiPlatformConfig = {
  subscription: { priceUsd: number; durationDays: number; currency: string };
  course: { totalHours: number };
};
