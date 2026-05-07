import type { NextFunction, Request, Response } from "express";

import { subscriptionService } from "../services/subscription.service";
import { forbidden, unauthorized } from "../utils/http";

export async function requireActiveSubscription(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    next(unauthorized());
    return;
  }
  try {
    const sub = await subscriptionService.getStatus(req.auth.sub);
    if (!sub.active) {
      next(forbidden("Suscripción inactiva. Activá tu plan para continuar."));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
