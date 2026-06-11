import jwt from "jsonwebtoken";

const secret = process.env.SESSION_SECRET ?? "intern-train-dev-secret";

export function signToken(payload: { id: number; role: "student" | "admin" }): string {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifyToken(token: string): { id: number; role: "student" | "admin" } | null {
  try {
    return jwt.verify(token, secret) as { id: number; role: "student" | "admin" };
  } catch {
    return null;
  }
}
