import type { Vencimiento } from "../models";

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const seedVencimientos: Vencimiento[] = [
  {
    id: "seed-venc-1",
    userId: "seed-piloto-juan",
    titulo: "CMA Clase 2",
    tipo: "CMA",
    fechaVencimiento: inDays(45),
    notas: "Renovar en INMAE.",
    createdAt: new Date("2025-02-01T12:00:00Z").toISOString(),
  },
  {
    id: "seed-venc-2",
    userId: "seed-piloto-juan",
    titulo: "Habilitación nocturna",
    tipo: "Habilitacion",
    fechaVencimiento: inDays(120),
    createdAt: new Date("2025-02-01T12:00:00Z").toISOString(),
  },
  {
    id: "seed-venc-3",
    userId: "seed-aero-morón",
    titulo: "Seguro hangar principal",
    tipo: "Seguro",
    fechaVencimiento: inDays(15),
    notas: "Revisar póliza con corredor.",
    createdAt: new Date("2025-02-01T12:00:00Z").toISOString(),
  },
];
