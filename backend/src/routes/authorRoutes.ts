import { Router } from "express";
import { dashboard } from "../controllers/authorDashboardController";
import { authMiddleware } from "../middleware/auth";
import { authorOnly } from "../middleware/rbac";

const router = Router();

router.get("/dashboard", authMiddleware, authorOnly, dashboard);

export default router;
