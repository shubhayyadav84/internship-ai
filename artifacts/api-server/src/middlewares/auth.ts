import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export function requireStudent(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload || payload.role !== "student") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { studentId: number }).studentId = payload.id;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { adminId: number }).adminId = payload.id;
  next();
}
