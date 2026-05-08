import type { Request, Response, NextFunction } from "express";

import { userRepository } from "../repositories/user.repository";

export const usersController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const all = await userRepository.list();
      const sanitized = all.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
      }));
      res.json(sanitized);
    } catch (err) {
      next(err);
    }
  },
};
