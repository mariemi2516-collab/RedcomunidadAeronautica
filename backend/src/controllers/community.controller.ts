import type { Request, Response, NextFunction } from "express";

import { communityService } from "../services/community.service";
import { unauthorized } from "../utils/http";

export const communityController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await communityService.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const post = await communityService.create(req.auth.sub, {
        text: req.body?.text,
        imageDataUrl: req.body?.imageDataUrl,
      });
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      await communityService.remove(req.params.id, req.auth.sub);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw unauthorized();
      const post = await communityService.toggleLike(
        req.params.id,
        req.auth.sub,
      );
      res.json(post);
    } catch (err) {
      next(err);
    }
  },
};
