import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "./jwt";

export const COOKIE_NAME = "cnb_token";

export async function getSession(): Promise<TokenPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
