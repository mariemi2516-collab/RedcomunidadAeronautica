import { Router } from "express";

import { usersController } from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, usersController.list);
