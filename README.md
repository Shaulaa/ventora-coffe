# Ventora Coffee, Web Coffeeshop

Project belajar vibe coding, dibangun bertahap dari Fase 1 (fondasi).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Firebase (Auth + Firestore)
- next-themes buat dark mode

## Cara jalanin di lokal

1. Install dependency

   ```bash
   npm install
   ```

2. Setup Firebase
   - Buka [Firebase Console](https://console.firebase.google.com), buat project baru
   - Aktifkan **Authentication > Sign-in method > Email/Password** dan **Google**
   - Aktifkan **Firestore Database**
   - Buka Project Settings > General > Your apps, tambah Web App, copy config-nya
   - Salin `.env.local.example` jadi `.env.local`, isi semua value dari config tadi

3. Jalanin dev server

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000)

## Dokumentasi lengkap

- `CLAUDE.md`, konteks utama project, aturan baku, dan checklist nambah fitur
- `docs/DESIGN_SYSTEM.md`, token warna, tipografi, dan prinsip visual
- `docs/DATA_MODEL.md`, skema Firestore dan Security Rules yang wajib dipasang
- `docs/ROADMAP.md`, status tiap fase dan checklist fitur yang belum jalan

Kalau lanjut ngoding pake AI assistant (Claude Code, Cursor, dll), pastiin
baca `CLAUDE.md` dulu, biar gak nanya ulang hal yang udah difinalin.

## Fitur yang udah jadi (Fase 1)

- Landing page (hero, promo banner, rekomendasi menu)
- Dark mode toggle
- Login & register pakai Firebase Auth (email/password + Google Sign-In)
- Halaman menu (masih data dummy, belum konek Firestore)

## Fitur yang nyusul

- Fase 2, menu & katalog konek ke Firestore beneran, sistem rating
- Fase 3, keranjang belanja, checkout, history & status order
- Fase 4, reservasi meja, promo dari database, rekomendasi berbasis data asli
- Fase 5, dashboard admin

## Struktur folder penting

```
src/
  app/            halaman (landing, login, register, menu)
  components/     komponen UI (Navbar, Hero, ProductCard, dll)
  context/        AuthContext buat status login global
  lib/            firebase.ts (init) dan dummy-products.ts (data sementara)
```

## Catatan security

- Jangan commit file `.env.local`, udah otomatis masuk `.gitignore`
- Setelah bikin Firestore, wajib pasang Security Rules sebelum deploy publik
  (baru default "test mode" yang kebuka buat siapa aja)
