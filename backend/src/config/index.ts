import path from "path";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: envInt("PORT", 4000),
  jwt: {
    secret: process.env.JWT_SECRET ?? "rca-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  subscription: {
    priceUsd: envInt("SUBSCRIPTION_PRICE_USD", 4),
    durationDays: 30,
  },
  course: {
    totalHours: envInt("COURSE_TOTAL_HOURS", 40),
  },
  paths: {
    dataDir: path.resolve(__dirname, "..", "..", "data"),
    uploadsDir: path.resolve(__dirname, "..", "..", "uploads"),
  },
} as const;

export type AppConfig = typeof config;
