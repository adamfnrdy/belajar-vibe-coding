import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { app } from "../src/index";
import { db, users, sessions } from "../src/db";

describe("User API Tests", () => {
  beforeAll(async () => {
    // Clean up the tables before tests (sessions first due to FK)
    await db.delete(sessions);
    await db.delete(users);
  });

  afterAll(async () => {
    // Clean up after tests run
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("User Registration API", () => {
    it("should successfully register a new user", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "rahasia",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: "OK" });
    });

    it("should fail to register user with duplicate email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Eko Baru",
            email: "eko@localhost",
            password: "passwordbaru",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Email sudah terdaftar" });
    });
  });

  describe("User Login API", () => {
    it("should successfully login registered user and return token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "rahasia",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
      expect(body.data.length).toBeGreaterThan(0);
    });

    it("should fail to login with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "salahpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ message: "Email atau password salah" });
    });

    it("should fail to login with unregistered email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "tidakdaftar@localhost",
            password: "rahasia",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ message: "Email atau password salah" });
    });
  });

  describe("Get Current User API", () => {
    let token: string;

    beforeAll(async () => {
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Eko Current",
            email: "ekocurrent@localhost",
            password: "rahasiacurrent",
          }),
        })
      );

      const loginResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "ekocurrent@localhost",
            password: "rahasiacurrent",
          }),
        })
      );
      const loginResult = await loginResponse.json();
      token = loginResult.data;
    });

    it("should successfully get current logged in user details", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe("Eko Current");
      expect(body.data.email).toBe("ekocurrent@localhost");
      expect(body.data.created_at).toBeDefined();
      expect(body.data.password).toBeUndefined();
    });

    it("should fail with 401 if Authorization header is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("should fail with 401 if token format is incorrect", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `invalidtokenformat`,
          },
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("should fail with 401 if token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${crypto.randomUUID()}`,
          },
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });
});

