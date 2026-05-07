import type { Flight, FlightSettings } from "../models";
import { JsonStore } from "./jsonStore";

const flightsStore = new JsonStore<Flight[]>("flights", []);
const settingsStore = new JsonStore<FlightSettings[]>("flight-settings", []);

export const flightRepository = {
  async list(): Promise<Flight[]> {
    return flightsStore.read();
  },
  async listByUser(userId: string): Promise<Flight[]> {
    const all = await flightsStore.read();
    return all
      .filter((f) => f.userId === userId)
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
  },
  async create(record: Flight): Promise<Flight> {
    await flightsStore.update((current) => [...current, record]);
    return record;
  },
  async remove(userId: string, id: string): Promise<boolean> {
    let removed = false;
    await flightsStore.update((current) => {
      const next = current.filter((f) => {
        const match = f.id === id && f.userId === userId;
        if (match) removed = true;
        return !match;
      });
      return next;
    });
    return removed;
  },
  async replaceAll(records: Flight[]): Promise<void> {
    await flightsStore.write(records);
  },

  async getSettings(userId: string): Promise<FlightSettings | undefined> {
    const all = await settingsStore.read();
    return all.find((s) => s.userId === userId);
  },
  async upsertSettings(record: FlightSettings): Promise<FlightSettings> {
    await settingsStore.update((current) => {
      const idx = current.findIndex((s) => s.userId === record.userId);
      if (idx === -1) return [...current, record];
      const next = current.slice();
      next[idx] = record;
      return next;
    });
    return record;
  },
  async replaceAllSettings(records: FlightSettings[]): Promise<void> {
    await settingsStore.write(records);
  },
};
