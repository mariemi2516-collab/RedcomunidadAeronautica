import { Router } from "express";

import { config } from "../config";

import { aerodromosRouter } from "./aerodromos.routes";
import { authRouter } from "./auth.routes";
import { communityRouter } from "./community.routes";
import { flightsRouter } from "./flights.routes";
import { subscriptionsRouter } from "./subscriptions.routes";
import { usersRouter } from "./users.routes";
import { vencimientosRouter } from "./vencimientos.routes";

export function buildApiRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "rca-backend",
      time: new Date().toISOString(),
    });
  });

  router.get("/config", (_req, res) => {
    res.json({
      subscription: {
        priceUsd: config.subscription.priceUsd,
        durationDays: config.subscription.durationDays,
        currency: "USD",
      },
      course: {
        totalHours: config.course.totalHours,
      },
    });
  });

  router.use("/auth", authRouter);
  router.use("/users", usersRouter);
  router.use("/subscriptions", subscriptionsRouter);
  router.use("/aerodromos", aerodromosRouter);
  router.use("/vencimientos", vencimientosRouter);
  router.use("/flights", flightsRouter);
  router.use("/community", communityRouter);

  return router;
}
