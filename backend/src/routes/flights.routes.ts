import { Router } from "express";

import { flightController } from "../controllers/flight.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

export const flightsRouter = Router();

flightsRouter.use(requireAuth, requireActiveSubscription);
flightsRouter.get("/", flightController.list);
flightsRouter.post("/", flightController.create);
flightsRouter.delete("/:id", flightController.remove);
flightsRouter.get("/settings", flightController.getSettings);
flightsRouter.put("/settings", flightController.updateSettings);
flightsRouter.get("/progress", flightController.progress);
