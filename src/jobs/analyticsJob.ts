import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getYesterdayGMT(): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 1);
  return { start, end: today };
}

export async function aggregateDailyAnalytics(): Promise<void> {
  const { start, end } = getYesterdayGMT();
  const logs = await prisma.readLog.findMany({
    where: { readAt: { gte: start, lt: end } },
    select: { articleId: true },
  });

  const byArticle = new Map<string, number>();
  for (const log of logs) {
    byArticle.set(log.articleId, (byArticle.get(log.articleId) ?? 0) + 1);
  }

  const dateOnly = new Date(start);
  dateOnly.setUTCHours(0, 0, 0, 0);

  for (const [articleId, viewCount] of byArticle) {
    await prisma.dailyAnalytics.upsert({
      where: { articleId_date: { articleId, date: dateOnly } },
      create: { articleId, date: dateOnly, viewCount },
      update: { viewCount: { increment: viewCount } },
    });
  }
}

export function scheduleDailyAnalyticsCron(): void {
  // Tous les jours à minuit GMT (UTC).
  cron.schedule(
    "0 0 * * *",
    () => {
      aggregateDailyAnalytics().catch((err) => {
        // En production, on loggerait l'erreur proprement
        // eslint-disable-next-line no-console
        console.error("Failed to run daily analytics job:", err);
      });
    },
    { timezone: "Etc/UTC" }
  );
}

