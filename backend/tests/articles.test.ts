/**
 * Articles HTTP tests (database mocked via service mocks).
 */
import request from "supertest";
import app from "../src/app";
import * as articleService from "../src/services/articleService";
import jwt from "jsonwebtoken";

jest.mock("../src/services/articleService");
jest.mock("../src/services/readLogService", () => ({ recordRead: jest.fn() }));

const mockList = articleService.listPublic as jest.MockedFunction<typeof articleService.listPublic>;
const mockGetById = articleService.getById as jest.MockedFunction<typeof articleService.getById>;
const mockCreate = articleService.createArticle as jest.MockedFunction<typeof articleService.createArticle>;
const mockGetMy = articleService.getMyArticles as jest.MockedFunction<typeof articleService.getMyArticles>;
const mockUpdate = articleService.updateArticle as jest.MockedFunction<typeof articleService.updateArticle>;
const mockSoftDelete = articleService.softDeleteArticle as jest.MockedFunction<typeof articleService.softDeleteArticle>;

function authorToken(userId = "author-uuid") {
  return jwt.sign({ sub: userId, role: "author" }, process.env.JWT_SECRET ?? "test-secret", { expiresIn: "24h" });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /articles", () => {
  it("returns 200 and paginated list", async () => {
    mockList.mockResolvedValue({ items: [{ id: "a1", title: "News", category: "Tech", status: "Published", authorId: "u1", createdAt: new Date(), deletedAt: null, author: { id: "u1", name: "Jane" } }], total: 1 } as Awaited<ReturnType<typeof articleService.listPublic>>);

    const res = await request(app).get("/articles").query({ page: 1, size: 10 });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object).toHaveLength(1);
    expect(res.body.PageNumber).toBe(1);
    expect(res.body.TotalSize).toBe(1);
  });
});

describe("GET /articles/:id", () => {
  it("returns 200 when article exists and not deleted", async () => {
    const article = { id: "a1", title: "Title", content: "Content...", category: "Tech", status: "Published", authorId: "u1", createdAt: new Date(), deletedAt: null, author: { id: "u1", name: "Jane" } };
    mockGetById.mockResolvedValue({ found: true, article } as Awaited<ReturnType<typeof articleService.getById>>);

    const res = await request(app).get("/articles/a1");

    expect(res.status).toBe(200);
    expect(res.body.Object).toMatchObject({ id: "a1", title: "Title" });
  });

  it("returns 410 when article is soft-deleted", async () => {
    mockGetById.mockResolvedValue({ found: true, deleted: true } as unknown as Awaited<ReturnType<typeof articleService.getById>>);

    const res = await request(app).get("/articles/deleted-id");

    expect(res.status).toBe(410);
    expect(res.body.Errors).toContain("News article no longer available");
  });
});

describe("POST /articles (Author only)", () => {
  const validBody = { title: "My Article", content: "This is the content and it has at least fifty characters here.", category: "Tech", status: "Draft" };

  it("returns 401 without token", async () => {
    const res = await request(app).post("/articles").send(validBody);
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 201 with author token", async () => {
    const created = { id: "new-id", ...validBody, authorId: "author-uuid", createdAt: new Date(), deletedAt: null, author: { id: "author-uuid", name: "John", email: "j@x.com" } };
    mockCreate.mockResolvedValue(created as Awaited<ReturnType<typeof articleService.createArticle>>);

    const res = await request(app).post("/articles").set("Authorization", `Bearer ${authorToken()}`).send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.Object).toMatchObject({ id: "new-id", title: validBody.title });
    expect(mockCreate).toHaveBeenCalledWith("author-uuid", validBody);
  });
});

describe("GET /articles/me", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/articles/me");
    expect(res.status).toBe(401);
  });

  it("returns 200 with author token", async () => {
    mockGetMy.mockResolvedValue({ items: [{ id: "a1", title: "Draft", content: "x", category: "Tech", status: "Draft", authorId: "author-uuid", createdAt: new Date(), deletedAt: null, author: { id: "author-uuid", name: "Me" } }], total: 1 } as Awaited<ReturnType<typeof articleService.getMyArticles>>);

    const res = await request(app).get("/articles/me").set("Authorization", `Bearer ${authorToken()}`).query({ page: 1, size: 10 });

    expect(res.status).toBe(200);
    expect(res.body.Object).toHaveLength(1);
  });
});

describe("PUT /articles/:id", () => {
  it("returns 403 when updating another author article", async () => {
    mockUpdate.mockResolvedValue({ found: true, forbidden: true } as unknown as Awaited<ReturnType<typeof articleService.updateArticle>>);

    const res = await request(app).put("/articles/art-1").set("Authorization", `Bearer ${authorToken()}`).send({ title: "Updated" });

    expect(res.status).toBe(403);
    expect(res.body.Errors).toContain("You can only edit your own articles");
  });
});

describe("DELETE /articles/:id", () => {
  it("returns 200 on soft delete success", async () => {
    mockSoftDelete.mockResolvedValue({ found: true } as Awaited<ReturnType<typeof articleService.softDeleteArticle>>);

    const res = await request(app).delete("/articles/art-1").set("Authorization", `Bearer ${authorToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
  });
});
