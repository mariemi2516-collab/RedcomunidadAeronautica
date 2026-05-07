import type { Flight, FlightSettings } from "../models";

export const seedFlights: Flight[] = [
  {
    id: "seed-flight-1",
    userId: "seed-piloto-juan",
    fecha: "2025-01-15",
    matricula: "LV-XXX",
    origen: "SADM",
    destino: "SADM",
    duracionMin: 60,
    tipoVuelo: "Instruccion",
    observaciones: "Tráfico de pista con instructor.",
    costoUsd: 80,
    createdAt: new Date("2025-01-15T18:00:00Z").toISOString(),
  },
  {
    id: "seed-flight-2",
    userId: "seed-piloto-juan",
    fecha: "2025-01-22",
    matricula: "LV-XXX",
    origen: "SADM",
    destino: "SAZB",
    duracionMin: 95,
    tipoVuelo: "Travesia",
    observaciones: "Travesía solo controlada.",
    costoUsd: 126.67,
    createdAt: new Date("2025-01-22T18:00:00Z").toISOString(),
  },
  {
    id: "seed-flight-3",
    userId: "seed-piloto-juan",
    fecha: "2025-02-03",
    matricula: "LV-XXX",
    origen: "SADM",
    destino: "SADM",
    duracionMin: 70,
    tipoVuelo: "Local",
    observaciones: "Maniobras en zona local.",
    costoUsd: 93.33,
    createdAt: new Date("2025-02-03T18:00:00Z").toISOString(),
  },
];

export const seedFlightSettings: FlightSettings[] = [
  {
    userId: "seed-piloto-juan",
    pricePerHourUsd: 80,
    updatedAt: new Date("2025-01-10T12:00:00Z").toISOString(),
  },
  {
    userId: "seed-piloto-maria",
    pricePerHourUsd: 75,
    updatedAt: new Date("2025-01-10T12:00:00Z").toISOString(),
  },
  {
    userId: "seed-piloto-lucas",
    pricePerHourUsd: 90,
    updatedAt: new Date("2025-01-10T12:00:00Z").toISOString(),
  },
];
