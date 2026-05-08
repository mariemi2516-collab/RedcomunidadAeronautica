import type { Request, Response, NextFunction } from "express";

import { aerodromoService } from "../services/aerodromo.service";
import { forbidden, unauthorized } from "../utils/http";

export const aerodromoController = {
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await aerodromoService.getMine(req.auth.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async upsertMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      if (req.auth.role !== "aerodromo") {
        throw forbidden(
          "Sólo los usuarios con rol aeródromo pueden editar este registro",
        );
      }
      const data = await aerodromoService.upsertMine(req.auth.sub, req.body ?? {});
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aerodromoService.listAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
