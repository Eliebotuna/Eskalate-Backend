/**
 * Author dashboard HTTP tests (database mocked).
 */
import request from "supertest";
import app from "../src/app";
import * as authorDashboardService from "../src/services/authorDashboardService";
import jwt from "jsonwebtoken";

jest.mock("../src/services/authorDashboardService");

const mockedDashboard = authorDashboardService.getAuthorDashboard as jest.MockedFunction<typeof authorDashboardService.getAuthorDashboard>;

function authorToken(userId = "author-uuid") {
  return jwt.sign({ sub: userId, role: "author" }, process.env.JWT_SECRET ?? "test-secret", { expiresIn: "24h" });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /author/dashboard", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/author/dashboard");
    expect(res.status).toBe(401);
    expect(mockedDashboard).not.toHaveBeenCalled();
  });

  it("returns 403 with reader token", async () => {
    const readerToken = jwt.sign({ sub: "r1", role: "reader" }, process.env.JWT_SECRET ?? "test-secret", { expiresIn: "24h" });
    const res = await request(app).get("/author/dashboard").set("Authorization", `Bearer ${readerToken}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 with author token and TotalViews", async () => {
    mockedDashboard.mockResolvedValue({ items: [{ id: "a1", title: "My Article", createdAt: new Date(), TotalViews: 42 }], total: 1 });

    const res = await request(app).get("/author/dashboard").set("Authorization", `Bearer ${authorToken()}`).query({ page: 1, size: 10 });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object[0]).toMatchObject({ title: "My Article", TotalViews: 42 });
    expect(mockedDashboard).toHaveBeenCalledWith("author-uuid", 1, 10);
  });
});
