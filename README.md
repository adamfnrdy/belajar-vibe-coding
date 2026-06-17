# Belajar Vibe Coding - Backend API

Aplikasi ini adalah backend API sederhana yang dikembangkan sebagai proyek pembelajaran menggunakan runtime JavaScript super cepat **Bun** dan framework web **Elysia.js**. Aplikasi ini mengimplementasikan fitur dasar manajemen pengguna (User Management) termasuk registrasi, otentikasi (login), pengambilan profil pengguna, dan logout menggunakan *session-based authentication* sederhana (menyimpan token secara persisten di database).

## 🏗 Arsitektur & Struktur File

Proyek ini menggunakan struktur modular untuk memisahkan *concern* antara titik akses (routes), logika bisnis (services), dan konfigurasi penyimpanan (database).

### Struktur Folder
```text
belajar-vibe-coding/
├── src/
│   ├── db/            # Konfigurasi koneksi database & definisi skema (Drizzle ORM)
│   │   ├── index.ts   # Pembuatan koneksi pool MySQL dan instance Drizzle
│   │   └── schema.ts  # Definisi struktur tabel (users, sessions)
│   ├── router/        # Definisi rute/endpoint API
│   │   └── user-route.ts # Kelompok endpoint spesifik untuk User
│   ├── services/      # Logika bisnis yang menjembatani rute dan database
│   │   └── user-service.ts # Logika registrasi, hash password, cek login, dll.
│   └── index.ts       # Entry point utama, inisialisasi server framework Elysia
├── tests/             # File pengujian unit test terisolasi
│   ├── app.test.ts    # Uji coba untuk endpoint umum (seperti root & get all)
│   └── user.test.ts   # Uji coba lengkap fitur registrasi, login, & autorisasi
├── drizzle/           # (Opsional) Direktori default penyimpanan status migrasi Drizzle
├── .env               # File environment variables rahasia (kredensial DB)
└── package.json       # Definisi dependensi & skrip otomatisasi proyek
```

### Konvensi Penamaan (Naming Convention)
- **Nama Folder**: Disarankan menggunakan huruf kecil `kebab-case`.
- **File Entry & Konfigurasi Utama**: Menggunakan nama standar seperti `index.ts` dan `schema.ts`.
- **File Domain Fitur**: Menggabungkan nama entitas dan peran file menggunakan pola `[entitas]-[peran].ts` dalam format `kebab-case`. Contoh: `user-route.ts`, `user-service.ts`, `user.test.ts`.

## 🌐 API yang Tersedia

Berikut adalah daftar endpoint API yang dikonfigurasi:

| Method | Endpoint | Deskripsi Fitur | Butuh Token? |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Health check endpoint, memverifikasi status server berjalan. | Tidak |
| `GET` | `/users` | Mengambil seluruh data user mentah dari database. | Tidak |
| `POST` | `/api/users` | Registrasi user baru (melakukan *hashing* password). | Tidak |
| `POST` | `/api/users/login` | Login user, memvalidasi dan mengeluarkan token akses. | Tidak |
| `GET` | `/api/users/current`| Mengambil data detail profil user dari token sesi aktif. | **Ya** |
| `DELETE`| `/api/users/current`| Logout user, menghapus atau membatalkan sesi token. | **Ya** |

*(Catatan: Endpoint yang membutuhkan otorisasi wajib menyertakan token di HTTP Headers dengan format: `Authorization: Bearer <TOKEN>`)*

## 🗄 Schema Database

Aplikasi menggunakan database relasional MySQL yang skemanya direpresentasikan melalui **Drizzle ORM**.

### 1. Tabel `users`
Menyimpan identitas dasar dan info otentikasi utama pengguna.
- `id`: `Integer` (Auto-Increment / Primary Key)
- `name`: `Varchar(255)` (Not Null)
- `email`: `Varchar(255)` (Unique, Not Null)
- `password`: `Varchar(255)` (Not Null, disimpan dalam bentuk Hash Bcrypt)
- `createdAt`: `Timestamp` (Default: Nilai waktu saat data dimasukkan)

### 2. Tabel `sessions`
Menyimpan bukti sesi login yang sah untuk pengguna tertentu.
- `id`: `Integer` (Auto-Increment / Primary Key)
- `token`: `Varchar(255)` (Unique, Not Null) — Token UUIDv4
- `userId`: `BigInt` (Foreign Key merujuk ke relasi `users.id`)
- `createdAt`: `Timestamp` (Default: Nilai waktu login dilakukan)

## 🛠 Technology Stack & Libraries

Proyek ini dibangun memanfaatkan alat-alat pengembangan modern berikut:
- **Runtime**: [Bun](https://bun.com/) (v1.3.x) - Mesin JavaScript *all-in-one* yang menggabungkan runtime, bundler, test runner, dan package manager dalam satu tempat dengan eksekusi super cepat.
- **Web Framework**: [Elysia.js](https://elysiajs.com/) - Web framework berkinerja tinggi yang ditulis murni dan dirancang optimal untuk Bun, memiliki sistem validasi Schema ketat secara internal.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit - Library SQL-like ORM untuk TypeScript yang ringkas, tanpa abstraksi berlebihan, dan *type-safe*.
- **Database Driver**: `mysql2` - Client koneksi asinkron khusus database MySQL.
- **Testing**: Mengandalkan modul terintegrasi `bun:test` dari bawaan Bun itu sendiri.
- **Bahasa Inti**: TypeScript.

## 🚀 Setup Project

Untuk menjalankan proyek ini di mesin lokal, ikuti langkah berikut:

1. **Kloning Repositori** ke ruang kerja lokal Anda.
2. **Instal Dependensi** melalui package manager Bun:
   ```bash
   bun install
   ```
3. **Persiapan Variabel Lingkungan (*Environment Variables*)**:
   Buat duplikat dari file `.env.example` ke dalam `.env` baru, kemudian ubah nilai default berikut menyesuaikan instalasi server MySQL lokal Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=rahasia_database_anda
   DB_NAME=belajar_vibe_coding
   PORT=3000
   ```
4. **Penyelarasan Schema Database (*Migration / Push*)**:
   Pastikan Anda sudah membentukkan database kosong dengan nama sesuai variabel `DB_NAME` pada server DB Anda. Lalu kirimkan/tekan skema tabel aplikasi ke database aktual menggunakan Drizzle Kit:
   ```bash
   bun run db:push
   ```

## 🏃 Cara Run Aplikasi

Jalankan perintah ini untuk menyalakan mode *development*. Dalam mode ini, server akan melakukan *hot-reload* ketika mendeteksi ada perubahan kode (*watch mode*):

```bash
bun run dev
```

Server kini tersedia dan menerima permintaan HTTP (biasanya di `http://localhost:3000`). Tampilan log akan menonjolkan: `🦊 Elysia is running at localhost:3000`.

## 🧪 Cara Test Aplikasi

Sistem pengujian mencakup penanganan data secara ekstensif menggunakan skenario otomatis. Unit test ini diatur sedemikian rupa untuk membersihkan (truncate) tabel database setiap satu pengujian dimulai, hal ini memastikan tidak ada data tes "A" yang mencemari skenario tes "B" (*Strict Isolation*).

Gunakan perintah bawaan dari sistem tes Bun:

```bash
bun test
```

Anda akan menerima ringkasan visual mendetail di terminal jika proses pengujian (*Test Case*) berjalan dengan sukses atau menemui eror.
