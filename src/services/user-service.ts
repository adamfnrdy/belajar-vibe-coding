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

/**
 * Mendaftarkan pengguna baru ke dalam database.
 * Melakukan pengecekan duplikasi email dan melakukan proses hashing 
 * pada password sebelum menyimpannya ke tabel users.
 * 
 * @param data - Objek yang berisi name, email, dan password untuk registrasi
 * @throws Error jika email sudah terdaftar
 * @returns Object berisi status sukses
 */
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

/**
 * Melakukan proses otentikasi (login) untuk pengguna.
 * Mencari pengguna berdasarkan email, memverifikasi kecocokan password dengan hash,
 * lalu membuat sesi baru (token UUID) yang disimpan ke tabel sessions.
 * 
 * @param data - Objek yang berisi email dan password dari form login
 * @throws Error jika email tidak ditemukan atau password salah
 * @returns String token sesi (UUID) yang berhasil di-generate
 */
export async function loginUser(data: LoginUserInput) {
  // Find user by email
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  const [user] = existingUser;
  if (!user) {
    throw new Error("Email atau password salah");
  }

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

/**
 * Mengambil informasi detail profil pengguna yang sedang login (current user).
 * Melakukan query ke tabel sessions digabungkan (inner join) dengan tabel users 
 * untuk mendapatkan data pengguna berdasarkan token sesi yang valid.
 * 
 * @param token - String token sesi milik pengguna
 * @throws Error "Unauthorized" jika token tidak ditemukan atau tidak valid
 * @returns Objek profil pengguna (id, name, email, created_at)
 */
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

  const [user] = result;
  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt,
  };
}

/**
 * Melakukan proses logout pengguna dengan cara menghapus sesi yang aktif.
 * Mencari dan menghapus record dari tabel sessions berdasarkan token yang diberikan.
 * 
 * @param token - String token sesi yang ingin diakhiri (logout)
 * @throws Error "Unauthorized" jika token tidak ditemukan di database
 */
export async function logoutUser(token: string) {
  const [result] = await db
    .delete(sessions)
    .where(eq(sessions.token, token));

  if (result.affectedRows === 0) {
    throw new Error("Unauthorized");
  }
}

