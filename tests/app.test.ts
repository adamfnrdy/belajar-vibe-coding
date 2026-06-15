import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db, users, sessions } from "../src/db";

describe("General App API Tests", () => {
  beforeEach(async () => {
    // Clean up tables to ensure isolation
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("GET /", () => {
    it("should return 200 OK with server running message", async () => {
      const response = await app.handle(
        new Request("http://localhost/")
      );

      expect(response.status).toBe(200);
      const body: any = await response.json();
      expect(body).toEqual({ status: "OK", message: "Elysia server is running" });
    });
  });

  describe("GET /users", () => {
    it("should return an empty array if no users are registered", async () => {
      const response = await app.handle(
        new Request("http://localhost/users")
      );

      expect(response.status).toBe(200);
      const body: any = await response.json();
      expect(body).toEqual([]);
    });

    it("should return list of registered users", async () => {
      // Setup: register a user directly in db
      await db.insert(users).values({
        name: "Test User 1",
        email: "test1@localhost",
        password: "hashedpassword1",
      });
      await db.insert(users).values({
        name: "Test User 2",
        email: "test2@localhost",
        password: "hashedpassword2",
      });

      const response = await app.handle(
        new Request("http://localhost/users")
      );

      expect(response.status).toBe(200);
      const body: any = await response.json();
      expect(body.length).toBe(2);
      expect(body[0].name).toBe("Test User 1");
      expect(body[0].email).toBe("test1@localhost");
      expect(body[1].name).toBe("Test User 2");
      expect(body[1].email).toBe("test2@localhost");
    });
  });
});
