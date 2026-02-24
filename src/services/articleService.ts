import { PrismaClient, ArticleStatus } from "@prisma/client";
import { CreateArticleInput, UpdateArticleInput } from "../validators/article";
import { recordRead } from "./readLogService";

const prisma = new PrismaClient();

const statusMap = { Draft: "Draft" as const, Published: "Published" as const };

export async function createArticle(authorId: string, input: CreateArticleInput) {
  return prisma.article.create({
    data: {
      title: input.title,
      content: input.content,
      category: input.category,
      status: statusMap[input.status ?? "Draft"],
      authorId,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}

export async function getMyArticles(
  authorId: string,
  page: number,
  pageSize: number,
  includeDeleted?: boolean
) {
  const where = includeDeleted ? { authorId } : { authorId, deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.article.count({ where }),
  ]);
  return { items, total };
}

export async function updateArticle(articleId: string, userId: string, input: UpdateArticleInput) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, deletedAt: null },
  });
  if (!article) return { found: false as const };
  if (article.authorId !== userId) return { forbidden: true as const };
  const data: { title?: string; content?: string; category?: string; status?: ArticleStatus } = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) data.content = input.content;
  if (input.category !== undefined) data.category = input.category;
  if (input.status !== undefined) data.status = statusMap[input.status];
  const updated = await prisma.article.update({
    where: { id: articleId },
    data,
    include: { author: { select: { id: true, name: true } } },
  });
  return { found: true as const, article: updated };
}

export async function softDeleteArticle(articleId: string, userId: string) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, deletedAt: null },
  });
  if (!article) return { found: false as const };
  if (article.authorId !== userId) return { forbidden: true as const };
  await prisma.article.update({
    where: { id: articleId },
    data: { deletedAt: new Date() },
  });
  return { found: true as const };
}

export interface PublicListFilters {
  category?: string;
  author?: string;
  q?: string;
}

export async function listPublic(
  page: number,
  pageSize: number,
  filters: PublicListFilters
) {
  const where: Parameters<PrismaClient["article"]["findMany"]>[0]["where"] = {
    status: ArticleStatus.Published,
    deletedAt: null,
  };
  if (filters.category) where.category = filters.category;
  if (filters.q) where.title = { contains: filters.q, mode: "insensitive" };
  if (filters.author) {
    where.author = { name: { contains: filters.author, mode: "insensitive" } };
  }
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.article.count({ where }),
  ]);
  return { items, total };
}

export async function getById(articleId: string, readerId: string | undefined) {
  const article = await prisma.article.findFirst({
    where: { id: articleId },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!article) return { found: false as const };
  if (article.deletedAt) return { deleted: true as const };
  recordRead(articleId, readerId);
  return { found: true as const, article };
}
