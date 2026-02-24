import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import articleRoutes from "./routes/articleRoutes";
import authorRoutes from "./routes/authorRoutes";
import { startAnalyticsWorker } from "./queue/analyticsWorker";
import { scheduleDailyAggregation } from "./queue/analyticsQueue";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/author", authorRoutes);

app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

startAnalyticsWorker();
scheduleDailyAggregation();

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
