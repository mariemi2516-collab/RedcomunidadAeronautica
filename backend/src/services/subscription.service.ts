import { config } from "../config";
import type { Subscription } from "../models";
import { subscriptionRepository } from "../repositories/subscription.repository";

export const subscriptionService = {
  async getStatus(userId: string): Promise<Subscription> {
    const existing = await subscriptionRepository.findByUser(userId);
    if (existing) return this.refreshActive(existing);
    const fresh: Subscription = {
      userId,
      active: false,
      priceUsd: config.subscription.priceUsd,
    };
    await subscriptionRepository.upsert(fresh);
    return fresh;
  },

  async activate(userId: string, paymentRef?: string): Promise<Subscription> {
    const now = new Date();
    const expires = new Date(
      now.getTime() + config.subscription.durationDays * 86400 * 1000,
    );
    const sub: Subscription = {
      userId,
      active: true,
      priceUsd: config.subscription.priceUsd,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      paymentRef,
    };
    await subscriptionRepository.upsert(sub);
    return sub;
  },

  async cancel(userId: string): Promise<Subscription> {
    const sub: Subscription = {
      userId,
      active: false,
      priceUsd: config.subscription.priceUsd,
    };
    await subscriptionRepository.upsert(sub);
    return sub;
  },

  refreshActive(sub: Subscription): Subscription {
    if (!sub.active) return sub;
    if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
      return { ...sub, active: false };
    }
    return sub;
  },
};
