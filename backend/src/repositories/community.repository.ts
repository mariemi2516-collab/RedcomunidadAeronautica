import type { CommunityPost } from "../models";
import { JsonStore } from "./jsonStore";

const store = new JsonStore<CommunityPost[]>("community", []);

export const communityRepository = {
  async list(): Promise<CommunityPost[]> {
    const all = await store.read();
    return all
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },
  async findById(id: string): Promise<CommunityPost | undefined> {
    const all = await store.read();
    return all.find((p) => p.id === id);
  },
  async create(post: CommunityPost): Promise<CommunityPost> {
    await store.update((current) => [post, ...current]);
    return post;
  },
  async remove(id: string, authorId: string): Promise<boolean> {
    let removed = false;
    await store.update((current) => {
      const next = current.filter((p) => {
        const match = p.id === id && p.authorId === authorId;
        if (match) removed = true;
        return !match;
      });
      return next;
    });
    return removed;
  },
  async toggleLike(id: string, userId: string): Promise<CommunityPost | undefined> {
    let updated: CommunityPost | undefined;
    await store.update((current) =>
      current.map((p) => {
        if (p.id !== id) return p;
        const has = p.likes.includes(userId);
        const likes = has
          ? p.likes.filter((l) => l !== userId)
          : [...p.likes, userId];
        updated = { ...p, likes };
        return updated;
      }),
    );
    return updated;
  },
  async replaceAll(posts: CommunityPost[]): Promise<void> {
    await store.write(posts);
  },
};
