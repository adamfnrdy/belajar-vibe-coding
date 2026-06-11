import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { app } from "../src/index";
import { db, users } from "../src/db";

describe("User Registration API", () => {
  beforeAll(async () => {
    // Clean up the users table before tests
    await db.delete(users);
  });

  afterAll(async () => {
    // Clean up after tests run
    await db.delete(users);
  });

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
