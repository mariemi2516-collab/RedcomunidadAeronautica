import jwt, { SignOptions } from "jsonwebtoken";

import { config } from "../config";

export type AuthTokenPayload = {
  sub: string;
  role: "piloto" | "aerodromo";
  email: string;
};

export function signAuthToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, config.jwt.secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as AuthTokenPayload;
}
