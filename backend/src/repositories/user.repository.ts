import type { User } from "../models";
import { JsonStore } from "./jsonStore";

const store = new JsonStore<User[]>("users", []);

export const userRepository = {
  async list(): Promise<User[]> {
    return store.read();
  },
  async findById(id: string): Promise<User | undefined> {
    const all = await store.read();
    return all.find((u) => u.id === id);
  },
  async findByEmail(email: string): Promise<User | undefined> {
    const norm = email.trim().toLowerCase();
    const all = await store.read();
    return all.find((u) => u.email.toLowerCase() === norm);
  },
  async create(user: User): Promise<User> {
    await store.update((current) => [...current, user]);
    return user;
  },
  async update(id: string, patch: Partial<User>): Promise<User> {
    let updated: User | undefined;
    await store.update((current) =>
      current.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...patch, id: u.id };
        return updated;
      }),
    );
    if (!updated) throw new Error("User not found");
    return updated;
  },
  async replaceAll(users: User[]): Promise<void> {
    await store.write(users);
  },
};
