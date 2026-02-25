import { Request, Response } from "express";
import { getAuthorDashboard } from "../services/authorDashboardService";
import { sendPaginated } from "../utils/response";

export async function dashboard(req: Request, res: Response): Promise<void> {
  const authorId = req.userId!;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.size), 10) || 10));
  const { items, total } = await getAuthorDashboard(authorId, page, pageSize);
  sendPaginated(res, "Dashboard retrieved", items, page, pageSize, total);
}
