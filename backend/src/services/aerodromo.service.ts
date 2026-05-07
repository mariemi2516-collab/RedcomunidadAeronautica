import type { Aerodromo } from "../models";
import { aerodromoRepository } from "../repositories/aerodromo.repository";
import { badRequest } from "../utils/http";
import { uid } from "../utils/ids";

export const aerodromoService = {
  async getMine(userId: string): Promise<Aerodromo | null> {
    return (await aerodromoRepository.findByOwner(userId)) ?? null;
  },

  async upsertMine(
    userId: string,
    payload: Partial<Omit<Aerodromo, "id" | "ownerId" | "updatedAt">>,
  ): Promise<Aerodromo> {
    const existing = await aerodromoRepository.findByOwner(userId);
    const nombre = (payload.nombre ?? existing?.nombre)?.trim();
    if (!nombre) throw badRequest("El nombre del aeródromo es obligatorio");
    const record: Aerodromo = {
      id: existing?.id ?? uid(),
      ownerId: userId,
      nombre,
      icao: payload.icao?.trim() ?? existing?.icao,
      ciudad: payload.ciudad?.trim() ?? existing?.ciudad,
      provincia: payload.provincia?.trim() ?? existing?.provincia,
      pista: payload.pista?.trim() ?? existing?.pista,
      frecuencia: payload.frecuencia?.trim() ?? existing?.frecuencia,
      contacto: payload.contacto?.trim() ?? existing?.contacto,
      descripcion: payload.descripcion?.trim() ?? existing?.descripcion,
      updatedAt: new Date().toISOString(),
    };
    return aerodromoRepository.upsert(record);
  },

  async listAll(): Promise<Aerodromo[]> {
    return aerodromoRepository.list();
  },
};
