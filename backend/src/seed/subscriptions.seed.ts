import { config } from "../config";
import type { Subscription } from "../models";
import { seedUsers } from "./users.seed";

export function buildSeedSubscriptions(): Subscription[] {
  const now = new Date();
  const expires = new Date(
    now.getTime() + config.subscription.durationDays * 86400 * 1000,
  );
  return seedUsers.map((u) => {
    const active = u.email === "juan.piloto@aero.test" || u.email === "moron@aero.test";
    return {
      userId: u.id,
      active,
      priceUsd: config.subscription.priceUsd,
      startedAt: active ? now.toISOString() : undefined,
      expiresAt: active ? expires.toISOString() : undefined,
      paymentRef: active ? "seed-demo" : undefined,
    };
  });
}
