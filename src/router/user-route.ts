import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";

function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.substring(7);
}

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
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ minLength: 1, maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 255 }),
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
        email: t.String({ minLength: 1, maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 255 }),
      }),
    }
  )
  .get(
    "/users/current",
    async ({ headers, set }) => {
      try {
        const token = extractBearerToken(headers["authorization"]);
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
        
        const user = await getCurrentUser(token);
        return { data: user };
      } catch (error) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
  )
  .delete(
    "/users/current",
    async ({ headers, set }) => {
      try {
        const token = extractBearerToken(headers["authorization"]);
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
        
        await logoutUser(token);
        return { data: "OK" };
      } catch (error) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
  );

