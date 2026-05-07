import type { Request, Response, NextFunction } from "express";

import { vencimientoService } from "../services/vencimiento.service";
import { unauthorized } from "../utils/http";

export const vencimientoController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await vencimientoService.listMine(req.auth.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await vencimientoService.createMine(
        req.auth.sub,
        req.body ?? {},
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      await vencimientoService.removeMine(req.auth.sub, req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
