import { Router } from "express";

import { vencimientoController } from "../controllers/vencimiento.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

export const vencimientosRouter = Router();

vencimientosRouter.use(requireAuth, requireActiveSubscription);
vencimientosRouter.get("/", vencimientoController.list);
vencimientosRouter.post("/", vencimientoController.create);
vencimientosRouter.delete("/:id", vencimientoController.remove);
