import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";
import { Role } from "@prisma/client";

interface JwtPayload {
  sub: string;
  role: Role;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "Unauthorized", ["Missing or invalid Authorization header"], 401);
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch {
    sendError(res, "Unauthorized", ["Invalid or expired token"], 401);
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.userId = decoded.sub;
    req.userRole = decoded.role;
  } catch {
    // ignore
  }
  next();
}
