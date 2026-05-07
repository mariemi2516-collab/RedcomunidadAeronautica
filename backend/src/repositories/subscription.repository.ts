import type { Subscription } from "../models";
import { JsonStore } from "./jsonStore";

const store = new JsonStore<Subscription[]>("subscriptions", []);

export const subscriptionRepository = {
  async list(): Promise<Subscription[]> {
    return store.read();
  },
  async findByUser(userId: string): Promise<Subscription | undefined> {
    const all = await store.read();
    return all.find((s) => s.userId === userId);
  },
  async upsert(sub: Subscription): Promise<Subscription> {
    await store.update((current) => {
      const idx = current.findIndex((s) => s.userId === sub.userId);
      if (idx === -1) return [...current, sub];
      const next = current.slice();
      next[idx] = sub;
      return next;
    });
    return sub;
  },
  async replaceAll(subs: Subscription[]): Promise<void> {
    await store.write(subs);
  },
};
