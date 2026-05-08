import type { Vencimiento } from "../models";
import { JsonStore } from "./jsonStore";

const store = new JsonStore<Vencimiento[]>("vencimientos", []);

export const vencimientoRepository = {
  async list(): Promise<Vencimiento[]> {
    return store.read();
  },
  async listByUser(userId: string): Promise<Vencimiento[]> {
    const all = await store.read();
    return all
      .filter((v) => v.userId === userId)
      .sort(
        (a, b) =>
          new Date(a.fechaVencimiento).getTime() -
          new Date(b.fechaVencimiento).getTime(),
      );
  },
  async create(record: Vencimiento): Promise<Vencimiento> {
    await store.update((current) => [...current, record]);
    return record;
  },
  async remove(userId: string, id: string): Promise<boolean> {
    let removed = false;
    await store.update((current) => {
      const next = current.filter((v) => {
        const match = v.id === id && v.userId === userId;
        if (match) removed = true;
        return !match;
      });
      return next;
    });
    return removed;
  },
  async replaceAll(records: Vencimiento[]): Promise<void> {
    await store.write(records);
  },
};
