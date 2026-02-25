import { Request, Response } from "express";
import * as articleService from "../services/articleService";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { CreateArticleInput, UpdateArticleInput } from "../validators/article";

export async function create(req: Request, res: Response): Promise<void> {
  const authorId = req.userId!;
  const input = req.body as CreateArticleInput;
  const article = await articleService.createArticle(authorId, input);
  sendSuccess(res, "Article created", article, 201);
}

export async function getMyArticles(req: Request, res: Response): Promise<void> {
  const authorId = req.userId!;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.size), 10) || 10));
  const includeDeleted = req.query.includeDeleted === "true";
  const { items, total } = await articleService.getMyArticles(authorId, page, pageSize, includeDeleted);
  sendPaginated(res, "Articles retrieved", items, page, pageSize, total);
}

export async function update(req: Request, res: Response): Promise<void> {
  const articleId = req.params.id;
  const userId = req.userId!;
  const input = req.body as UpdateArticleInput;
  const result = await articleService.updateArticle(articleId, userId, input);
  if (!result.found) {
    sendError(res, "Not found", ["Article not found"], 404);
    return;
  }
  if (result.forbidden) {
    sendError(res, "Forbidden", ["You can only edit your own articles"], 403);
    return;
  }
  sendSuccess(res, "Article updated", result.article);
}

export async function softDelete(req: Request, res: Response): Promise<void> {
  const articleId = req.params.id;
  const userId = req.userId!;
  const result = await articleService.softDeleteArticle(articleId, userId);
  if (!result.found) {
    sendError(res, "Not found", ["Article not found"], 404);
    return;
  }
  if (result.forbidden) {
    sendError(res, "Forbidden", ["You can only delete your own articles"], 403);
    return;
  }
  sendSuccess(res, "Article deleted");
}

export async function listPublic(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.size), 10) || 10));
  const filters: articleService.PublicListFilters = {};
  if (req.query.category) filters.category = String(req.query.category);
  if (req.query.author) filters.author = String(req.query.author);
  if (req.query.q) filters.q = String(req.query.q);
  const { items, total } = await articleService.listPublic(page, pageSize, filters);
  sendPaginated(res, "Articles retrieved", items, page, pageSize, total);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const articleId = req.params.id;
  const readerId = req.userId;
  const result = await articleService.getById(articleId, readerId);
  if (!result.found) {
    sendError(res, "Not found", ["Article not found"], 404);
    return;
  }
  if (result.deleted) {
    sendError(res, "Not available", ["News article no longer available"], 410);
    return;
  }
  sendSuccess(res, "Article retrieved", result.article);
}
