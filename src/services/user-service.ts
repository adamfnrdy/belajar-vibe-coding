import { db, users, sessions } from "../db";
import { eq } from "drizzle-orm";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterUserInput) {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password using Bun's built-in bcrypt
  const hashedPassword = await Bun.password.hash(data.password, "bcrypt");

  // Save user to database
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return { success: true };
}

export async function loginUser(data: LoginUserInput) {
  // Find user by email
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = existingUser[0];

  // Verify password using Bun's built-in bcrypt verify
  const isPasswordValid = await Bun.password.verify(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // Generate UUID token
  const token = crypto.randomUUID();

  // Save session to database
  await db.insert(sessions).values({
    token: token,
    userId: user.id,
  });

  return token;
}

export async function getCurrentUser(token: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Unauthorized");
  }

  const user = result[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt,
  };
}

