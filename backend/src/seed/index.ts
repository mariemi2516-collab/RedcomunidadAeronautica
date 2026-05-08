import fs from "fs/promises";

import { config } from "../config";
import { aerodromoRepository } from "../repositories/aerodromo.repository";
import { communityRepository } from "../repositories/community.repository";
import { flightRepository } from "../repositories/flight.repository";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { userRepository } from "../repositories/user.repository";
import { vencimientoRepository } from "../repositories/vencimiento.repository";

import { seedAerodromos } from "./aerodromos.seed";
import { seedCommunityPosts } from "./community.seed";
import { seedFlights, seedFlightSettings } from "./flights.seed";
import { buildSeedSubscriptions } from "./subscriptions.seed";
import { buildSeedUsers } from "./users.seed";
import { seedVencimientos } from "./vencimientos.seed";

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function seedIfEmpty(): Promise<{ seeded: boolean }> {
  await fs.mkdir(config.paths.dataDir, { recursive: true });
  const usersPath = `${config.paths.dataDir}/users.json`;
  const exists = await fileExists(usersPath);
  if (exists) {
    const current = await userRepository.list();
    if (current.length > 0) return { seeded: false };
  }
  return seedAll();
}

export async function seedAll(): Promise<{ seeded: true }> {
  const users = await buildSeedUsers();
  await userRepository.replaceAll(users);
  await subscriptionRepository.replaceAll(buildSeedSubscriptions());
  await aerodromoRepository.replaceAll(seedAerodromos);
  await vencimientoRepository.replaceAll(seedVencimientos);
  await flightRepository.replaceAll(seedFlights);
  await flightRepository.replaceAllSettings(seedFlightSettings);
  await communityRepository.replaceAll(seedCommunityPosts);
  return { seeded: true };
}
