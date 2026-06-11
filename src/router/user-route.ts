import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        await registerUser(body);
        return { data: "OK" };
      } catch (error) {
        set.status = 400;
        return { error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);
        return { data: token };
      } catch (error) {
        set.status = 400;
        return { message: (error as Error).message };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get(
    "/users/current",
    async ({ headers, set }) => {
      try {
        const authorization = headers["authorization"];
        if (!authorization || !authorization.startsWith("Bearer ")) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
        
        const token = authorization.substring(7);
        const user = await getCurrentUser(token);
        return { data: user };
      } catch (error) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
  );

