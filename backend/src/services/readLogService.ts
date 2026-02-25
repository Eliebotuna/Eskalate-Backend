import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function recordRead(articleId: string, readerId: string | undefined): void {
  setImmediate(() => {
    prisma.readLog
      .create({
        data: { articleId, readerId: readerId ?? null },
      })
      .catch(() => {
        // non-blocking: do not fail the request
      });
  });
}
