import type { Request, Response, NextFunction } from "express";

import { flightService } from "../services/flight.service";
import { unauthorized } from "../utils/http";

export const flightController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await flightService.listMine(req.auth.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await flightService.createMine(req.auth.sub, req.body ?? {});
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      await flightService.removeMine(req.auth.sub, req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await flightService.getSettings(req.auth.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const price = Number(req.body?.pricePerHourUsd);
      const data = await flightService.updateSettings(req.auth.sub, price);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async progress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const data = await flightService.getProgress(req.auth.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
