import { Queue } from "bullmq";
import { env } from "../config/env";

const connection = { url: env.redisUrl };

export const analyticsQueue = new Queue("daily-analytics", { connection });

const JOB_DAILY_AGGREGATION = "daily-aggregation";

export function scheduleDailyAggregation(): void {
  analyticsQueue.add(
    JOB_DAILY_AGGREGATION,
    {},
    {
      repeat: { pattern: "0 0 * * *" },
      jobId: "daily-aggregation-gmt",
    }
  ).catch(() => {});
}

export function runDailyAggregationNow(): Promise<unknown> {
  return analyticsQueue.add(JOB_DAILY_AGGREGATION, {});
}
