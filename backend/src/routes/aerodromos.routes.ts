import { Router } from "express";

import { aerodromoController } from "../controllers/aerodromo.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

export const aerodromosRouter = Router();

aerodromosRouter.use(requireAuth);
aerodromosRouter.get("/", aerodromoController.listAll);
aerodromosRouter.get(
  "/me",
  requireActiveSubscription,
  aerodromoController.getMine,
);
aerodromosRouter.put(
  "/me",
  requireActiveSubscription,
  aerodromoController.upsertMine,
);
