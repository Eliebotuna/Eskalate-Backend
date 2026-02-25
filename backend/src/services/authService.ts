import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import { env } from "../config/env";
import { SignupInput, LoginInput } from "../validators/auth";

const prisma = new PrismaClient();

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { success: false as const, conflict: true };
  }
  const hashedPassword = await argon2.hash(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role as Role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
  return { success: true as const, user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await argon2.verify(user.password, input.password))) {
    return { success: false as const };
  }
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
  return {
    success: true as const,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}
