# Ventora Coffee, Project Context

Dokumen ini adalah patokan utama buat siapa pun (manusia atau AI) yang lanjutin
project ini. Semua keputusan yang udah difinalin ada di sini. Kalau mau ubah
sesuatu yang tercatat di sini, ubah juga dokumennya, jangan cuma di kode.

Detail desain lengkap ada di `docs/DESIGN_SYSTEM.md`.
Detail struktur data ada di `docs/DATA_MODEL.md`.
Status & rencana fitur ada di `docs/ROADMAP.md`.

## Ringkasan project

Web coffeeshop bernama **Ventora Coffee**. Ini konsep fiktif buat belajar
vibe coding dan portofolio, bukan bisnis nyata. Targetnya, hasil akhirnya
bisa dipakai selayaknya aplikasi coffeeshop beneran (order online, reservasi,
dashboard admin), bukan sekadar landing page statis.

## Aturan baku, jangan diubah tanpa alasan kuat

1. **Bahasa & framework**, Next.js (App Router) + TypeScript + Tailwind CSS v4.
   Jangan ganti ke framework lain tanpa diskusi ulang.
2. **Backend**, Firebase (Auth + Firestore). Bukan Supabase, bukan backend
   custom. Semua fitur baru yang butuh data persisten, pakai Firestore.
3. **Struktur folder**, `src/app` buat routes, `src/components` buat UI,
   `src/context` buat state global (Auth, Cart, dst), `src/lib` buat util
   dan integrasi eksternal (firebase.ts, firestore helpers). Ikutin pola yang
   udah ada, jangan bikin pola baru buat hal yang mirip.
4. **Bahasa UI**, semua teks yang keliatan user pakai Bahasa Indonesia.
   Komentar kode boleh campur, tapi penjelasan teknis prefer Bahasa Indonesia.
5. **Environment variable**, kunci Firebase HARUS lewat `.env.local`,
   jangan pernah hardcode. Kalau fitur baru butuh API key eksternal lain,
   ikutin pola yang sama.
6. **Dark mode**, sudah jalan lewat `next-themes` + class `.dark` di html.
   Setiap komponen baru wajib punya varian dark mode, jangan cuma light mode.

## Status project (cek `docs/ROADMAP.md` buat detail lengkap)

**Fase 1–5 sudah selesai.** Semua fitur utama sudah berjalan:

- Landing page (Navbar, Hero, PromoBanner, rekomendasi produk, footer)
- Dark mode toggle
- Login & register (Firebase Auth: email/password + Google Sign-In)
- Halaman `/menu` dengan data dari Firestore (`products` collection)
- Halaman detail produk (`/menu/[id]`)
- Sistem rating & review (`reviews` collection, rating simpen ke `products`)
- Keranjang belanja (`/keranjang`) → checkout → nyimpen ke `orders` di Firestore
- Riwayat pesanan (`/pesanan`) real-time dari Firestore
- Reservasi meja (`/reservasi`, `reservations` collection), user bisa batalkan
- Promo banner dari Firestore (`promos` collection)
- Dashboard admin (`/admin`):
  - `/admin/products` — CRUD produk
  - `/admin/orders` — list & detail order, update status
  - `/admin/reviews` — list review
  - `/admin/reservations` — konfirmasi/tolak reservasi
  - `/admin/users` — manajemen user
  - `/admin/promos` — manajemen promo
- Firestore Security Rules sudah ada (`firestore.rules`)

## Yang BELUM ada

- Payment gateway beneran (checkout cuma simulasi status "sudah dibayar")
- Custom domain
- Testing E2E otomatis

## Perhatian sebelum deploy publik

- `firestore.rules` ada **fallback `allow all`** di baris 98–100 yang
  meng-override semua rule. WAJIB dihapus atau di-lock sebelum go-live.
- Environment variable production harus diisi di Vercel (bukan cuma `.env.local`).
- Testing manual tiap flow: register → order → checkout selesai.

## Kalau nambah fitur baru, checklist-nya

- [ ] Cek `docs/DATA_MODEL.md`, apakah collection Firestore yang dibutuhin
      udah didefinisiin, kalau belum, tambahin definisinya dulu
- [ ] Pastiin komponen baru punya varian dark mode
- [ ] Teks yang keliatan user pakai Bahasa Indonesia
- [ ] Kalau fitur butuh akses tulis ke Firestore, cek Security Rules-nya
- [ ] Update status di `docs/ROADMAP.md` kalau fase selesai
- [ ] Jalanin `npm run lint` dan `npm run build` sebelum dianggap kelar
