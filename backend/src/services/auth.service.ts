import type { PublicUser, User, UserRole } from "../models";
import { userRepository } from "../repositories/user.repository";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { hashPassword, verifyPassword } from "../utils/hash";
import { badRequest, conflict, unauthorized } from "../utils/http";
import { uid } from "../utils/ids";
import { signAuthToken } from "../utils/jwt";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toPublic(user: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = user;
  void _ignored;
  return rest;
}

export const authService = {
  async register(input: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? "";
    const name = input.name?.trim();
    const role = input.role;
    if (!email || !EMAIL_RE.test(email)) throw badRequest("Email inválido");
    if (password.length < 6)
      throw badRequest("La contraseña debe tener al menos 6 caracteres");
    if (!name) throw badRequest("Nombre requerido");
    if (role !== "piloto" && role !== "aerodromo")
      throw badRequest("Rol inválido");

    const existing = await userRepository.findByEmail(email);
    if (existing) throw conflict("Ya existe un usuario con ese email");

    const user: User = {
      id: uid(),
      email,
      name,
      role,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    await userRepository.create(user);
    await subscriptionRepository.upsert({
      userId: user.id,
      active: false,
      priceUsd: 4,
    });
    return this.makeSession(user);
  },

  async login(input: { email: string; password: string }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? "";
    if (!email || !password) throw badRequest("Email y contraseña requeridos");
    const user = await userRepository.findByEmail(email);
    if (!user) throw unauthorized("Credenciales inválidas");
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw unauthorized("Credenciales inválidas");
    return this.makeSession(user);
  },

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw unauthorized("Sesión inválida");
    return toPublic(user);
  },

  makeSession(user: User) {
    const token = signAuthToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    return { user: toPublic(user), token };
  },
};

export { toPublic };
