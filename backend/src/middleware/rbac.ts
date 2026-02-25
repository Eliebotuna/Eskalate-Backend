import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { Role } from "@prisma/client";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userId || !req.userRole) {
      sendError(res, "Unauthorized", ["Authentication required"], 401);
      return;
    }
    if (!roles.includes(req.userRole)) {
      sendError(res, "Forbidden", ["Insufficient permissions"], 403);
      return;
    }
    next();
  };
}

export const authorOnly = requireRole("author" as Role);
export const readerOnly = requireRole("reader" as Role);
