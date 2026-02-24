import { Router } from "express";
import { signup, login } from "../controllers/authController";
import { validateBody } from "../validators";
import { signupSchema, loginSchema } from "../validators/auth";

const router = Router();

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);

export default router;
