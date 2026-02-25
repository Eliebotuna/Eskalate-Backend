/**
 * Auth HTTP tests (database mocked via service mocks).
 */
import request from "supertest";
import app from "../src/app";
import * as authService from "../src/services/authService";

jest.mock("../src/services/authService");

const mockedSignup = authService.signup as jest.MockedFunction<typeof authService.signup>;
const mockedLogin = authService.login as jest.MockedFunction<typeof authService.login>;

beforeEach(() => jest.clearAllMocks());

describe("POST /auth/signup", () => {
  const validBody = { name: "John Doe", email: "john@example.com", password: "SecurePass1!", role: "author" };

  it("returns 201 and user + token on success", async () => {
    const user = { id: "user-uuid", name: validBody.name, email: validBody.email, role: "author" as const, createdAt: new Date() };
    mockedSignup.mockResolvedValue({ success: true, user, token: "jwt-token" } as Awaited<ReturnType<typeof authService.signup>>);

    const res = await request(app).post("/auth/signup").send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.token).toBe("jwt-token");
    expect(res.body.Object.user).toMatchObject({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  it("returns 409 when email already exists", async () => {
    mockedSignup.mockResolvedValue({ success: false, conflict: true } as Awaited<ReturnType<typeof authService.signup>>);

    const res = await request(app).post("/auth/signup").send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.Errors).toContain("Email already registered");
  });

  it("returns 400 when password is too weak", async () => {
    const res = await request(app).post("/auth/signup").send({ ...validBody, password: "short" });
    expect(res.status).toBe(400);
    expect(mockedSignup).not.toHaveBeenCalled();
  });
});

describe("POST /auth/login", () => {
  it("returns 200 and token on success", async () => {
    const user = { id: "u1", name: "John", email: "j@x.com", role: "author" as const };
    mockedLogin.mockResolvedValue({ success: true, user, token: "jwt" } as Awaited<ReturnType<typeof authService.login>>);

    const res = await request(app).post("/auth/login").send({ email: "j@x.com", password: "SecurePass1!" });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.token).toBe("jwt");
  });

  it("returns 401 on invalid credentials", async () => {
    mockedLogin.mockResolvedValue({ success: false } as Awaited<ReturnType<typeof authService.login>>);

    const res = await request(app).post("/auth/login").send({ email: "j@x.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.Errors).toContain("Invalid email or password");
  });
});
