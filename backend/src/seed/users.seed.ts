import type { User, UserRole } from "../models";
import { hashPassword } from "../utils/hash";

export type SeedUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  bio?: string;
};

export const seedUsers: SeedUser[] = [
  {
    id: "seed-piloto-juan",
    email: "juan.piloto@aero.test",
    password: "piloto123",
    name: "Juan Pérez",
    role: "piloto",
    bio: "Alumno PPL acumulando horas en SADM.",
  },
  {
    id: "seed-piloto-maria",
    email: "maria.piloto@aero.test",
    password: "piloto123",
    name: "María González",
    role: "piloto",
    bio: "PPL en formación, base SAOC.",
  },
  {
    id: "seed-piloto-lucas",
    email: "lucas.piloto@aero.test",
    password: "piloto123",
    name: "Lucas Romero",
    role: "piloto",
    bio: "Travesías por Patagonia, base SAZN.",
  },
  {
    id: "seed-aero-morón",
    email: "moron@aero.test",
    password: "aero123",
    name: "Aero Club Morón",
    role: "aerodromo",
    bio: "Aeródromo SADM, escuela de vuelo y hangares.",
  },
  {
    id: "seed-aero-rosario",
    email: "rosario@aero.test",
    password: "aero123",
    name: "Aero Club Rosario",
    role: "aerodromo",
    bio: "Aeropuerto SAAR, vuelos comerciales y aviación general.",
  },
];

export async function buildSeedUsers(): Promise<User[]> {
  return Promise.all(
    seedUsers.map(async (s) => ({
      id: s.id,
      email: s.email,
      passwordHash: await hashPassword(s.password),
      name: s.name,
      role: s.role,
      bio: s.bio,
      createdAt: new Date("2025-01-01T12:00:00Z").toISOString(),
    })),
  );
}
