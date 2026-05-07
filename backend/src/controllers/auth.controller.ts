import type { Request, Response, NextFunction } from "express";

import { authService } from "../services/auth.service";
import { subscriptionService } from "../services/subscription.service";
import { unauthorized } from "../utils/http";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await authService.register(req.body ?? {});
      const subscription = await subscriptionService.getStatus(session.user.id);
      res.status(201).json({ ...session, subscription });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await authService.login(req.body ?? {});
      const subscription = await subscriptionService.getStatus(session.user.id);
      res.json({ ...session, subscription });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const user = await authService.getProfile(req.auth.sub);
      const subscription = await subscriptionService.getStatus(req.auth.sub);
      res.json({ user, subscription });
    } catch (err) {
      next(err);
    }
  },
};
