export type UserRole = "piloto" | "aerodromo";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
  bio?: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Subscription = {
  userId: string;
  active: boolean;
  priceUsd: number;
  startedAt?: string;
  expiresAt?: string;
  paymentRef?: string;
};

export type Aerodromo = {
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
  updatedAt: string;
};

export type VencimientoTipo =
  | "CMA"
  | "Licencia"
  | "Seguro"
  | "Habilitacion"
  | "Otro";

export type Vencimiento = {
  id: string;
  userId: string;
  titulo: string;
  tipo: VencimientoTipo;
  fechaVencimiento: string;
  notas?: string;
  createdAt: string;
};

export type Flight = {
  id: string;
  userId: string;
  fecha: string;
  matricula: string;
  origen: string;
  destino: string;
  duracionMin: number;
  tipoVuelo: "Local" | "Travesia" | "Instruccion" | "Trabajo aereo";
  observaciones?: string;
  costoUsd?: number;
  createdAt: string;
};

export type FlightSettings = {
  userId: string;
  pricePerHourUsd: number;
  updatedAt: string;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  text: string;
  imageDataUrl?: string;
  createdAt: string;
  likes: string[];
};
