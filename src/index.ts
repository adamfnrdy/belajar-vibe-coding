import { Elysia } from "elysia";
import { db, users } from "./db";
import { userRoute } from "./router/user-route";

const port = process.env.PORT || 3000;

export const app = new Elysia()
  .get("/", () => ({ status: "OK", message: "Elysia server is running" }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { error: (error as Error).message };
    }
  })
  .use(userRoute);

app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
