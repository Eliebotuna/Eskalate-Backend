import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAuthorDashboard(authorId: string, page: number, pageSize: number) {
  const where = { authorId, deletedAt: null };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        createdAt: true,
        dailyAnalytics: { select: { viewCount: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);
  const items = articles.map((a) => ({
    id: a.id,
    title: a.title,
    createdAt: a.createdAt,
    TotalViews: a.dailyAnalytics.reduce((s, d) => s + d.viewCount, 0),
  }));
  return { items, total };
}
