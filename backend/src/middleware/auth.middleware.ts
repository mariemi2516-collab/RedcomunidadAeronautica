import type { NextFunction, Request, Response } from "express";

import { unauthorized } from "../utils/http";
import { verifyAuthToken, type AuthTokenPayload } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthTokenPayload;
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next(unauthorized("Token requerido"));
    return;
  }
  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    next(unauthorized("Token inválido o expirado"));
  }
}
