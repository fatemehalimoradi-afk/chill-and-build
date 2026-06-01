import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "cnb-dev-secret-change-in-prod";
const EXPIRES = "7d";

export type TokenPayload = { userId: number; email: string };

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
