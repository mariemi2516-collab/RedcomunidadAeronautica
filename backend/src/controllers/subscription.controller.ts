import type { Request, Response, NextFunction } from "express";

import { subscriptionService } from "../services/subscription.service";
import { unauthorized } from "../utils/http";

export const subscriptionController = {
  async status(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const sub = await subscriptionService.getStatus(req.auth.sub);
      res.json(sub);
    } catch (err) {
      next(err);
    }
  },

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const ref = (req.body?.paymentRef ?? req.body?.ref) as string | undefined;
      const sub = await subscriptionService.activate(req.auth.sub, ref);
      res.json(sub);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const sub = await subscriptionService.cancel(req.auth.sub);
      res.json(sub);
    } catch (err) {
      next(err);
    }
  },
};
