import { Router } from "express";
import {
  create,
  getMyArticles,
  update,
  softDelete,
  listPublic,
  getById,
} from "../controllers/articleController";
import { authMiddleware, optionalAuth } from "../middleware/auth";
import { authorOnly } from "../middleware/rbac";
import { validateBody } from "../validators";
import { createArticleSchema, updateArticleSchema } from "../validators/article";

const router = Router();

router.get("/", listPublic);

router.post(
  "/",
  authMiddleware,
  authorOnly,
  validateBody(createArticleSchema),
  create
);

router.get("/me", authMiddleware, authorOnly, getMyArticles);

router.get("/:id", optionalAuth, getById);

router.put(
  "/:id",
  authMiddleware,
  authorOnly,
  validateBody(updateArticleSchema),
  update
);

router.delete("/:id", authMiddleware, authorOnly, softDelete);

export default router;
