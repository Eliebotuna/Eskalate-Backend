import { Request, Response } from "express";
import { signup as signupService, login as loginService } from "../services/authService";
import { sendSuccess, sendError } from "../utils/response";
import { SignupInput, LoginInput } from "../validators/auth";

export async function signup(req: Request, res: Response): Promise<void> {
  const input = req.body as SignupInput;
  const result = await signupService(input);
  if (!result.success) {
    if (result.conflict) {
      sendError(res, "Conflict", ["Email already registered"], 409);
      return;
    }
    sendError(res, "Bad request", ["Signup failed"], 400);
    return;
  }
  sendSuccess(res, "Account created", { user: result.user, token: result.token }, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const result = await loginService(input);
  if (!result.success) {
    sendError(res, "Unauthorized", ["Invalid email or password"], 401);
    return;
  }
  sendSuccess(res, "Login successful", { user: result.user, token: result.token });
}
