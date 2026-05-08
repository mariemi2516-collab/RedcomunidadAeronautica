import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Ruta no encontrada" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error("[error]", err.message);
    res.status(500).json({ error: "Error interno", details: err.message });
    return;
  }
  res.status(500).json({ error: "Error interno" });
}
