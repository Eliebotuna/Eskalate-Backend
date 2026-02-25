import app from "./app";
import { env } from "./config/env";
import { scheduleDailyAnalyticsCron } from "./jobs/analyticsJob";

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

// Job quotidien pour agréger les ReadLogs en DailyAnalytics (GMT), sans Redis.
if (env.nodeEnv !== "test") {
  scheduleDailyAnalyticsCron();
}

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
