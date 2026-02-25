import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import articleRoutes from "./routes/articleRoutes";
import authorRoutes from "./routes/authorRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/author", authorRoutes);

app.use(errorHandler);

export default app;
