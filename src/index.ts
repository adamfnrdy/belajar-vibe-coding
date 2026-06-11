import { Elysia, t } from "elysia";
import { db, users } from "./db";

const port = process.env.PORT || 3000;

const app = new Elysia()
  .get("/", () => ({ status: "OK", message: "Elysia server is running" }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { error: (error as Error).message };
    }
  })
  .post(
    "/users",
    async ({ body }) => {
      try {
        await db.insert(users).values(body);
        return { success: true, message: "User created successfully" };
      } catch (error) {
        return { error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
