import { Router } from "express";

import { communityController } from "../controllers/community.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const communityRouter = Router();

communityRouter.get("/", communityController.list);
communityRouter.post("/", requireAuth, communityController.create);
communityRouter.delete("/:id", requireAuth, communityController.remove);
communityRouter.post("/:id/like", requireAuth, communityController.toggleLike);
