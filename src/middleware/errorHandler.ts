import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  const errors = [message];
  if (env.nodeEnv === "development" && statusCode === 500 && err.stack) {
    (errors as string[]).push(err.stack);
  }
  sendError(res, message, errors, statusCode);
}
