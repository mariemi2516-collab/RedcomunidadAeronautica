import { Router } from "express";

import { subscriptionController } from "../controllers/subscription.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const subscriptionsRouter = Router();

subscriptionsRouter.use(requireAuth);
subscriptionsRouter.get("/me", subscriptionController.status);
subscriptionsRouter.post("/activate", subscriptionController.activate);
subscriptionsRouter.post("/cancel", subscriptionController.cancel);
