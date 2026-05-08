import type { Aerodromo } from "../models";
import { JsonStore } from "./jsonStore";

const store = new JsonStore<Aerodromo[]>("aerodromos", []);

export const aerodromoRepository = {
  async list(): Promise<Aerodromo[]> {
    return store.read();
  },
  async findByOwner(ownerId: string): Promise<Aerodromo | undefined> {
    const all = await store.read();
    return all.find((a) => a.ownerId === ownerId);
  },
  async upsert(record: Aerodromo): Promise<Aerodromo> {
    await store.update((current) => {
      const idx = current.findIndex((a) => a.ownerId === record.ownerId);
      if (idx === -1) return [...current, record];
      const next = current.slice();
      next[idx] = record;
      return next;
    });
    return record;
  },
  async replaceAll(records: Aerodromo[]): Promise<void> {
    await store.write(records);
  },
};
