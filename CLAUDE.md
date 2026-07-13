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
   dan integrasi eksternal (firebase.ts, dummy data). Ikutin pola yang udah
   ada, jangan bikin pola baru buat hal yang mirip.
4. **Bahasa UI**, semua teks yang keliatan user pakai Bahasa Indonesia.
   Komentar kode boleh campur, tapi penjelasan teknis prefer Bahasa Indonesia.
5. **Environment variable**, kunci Firebase HARUS lewat `.env.local`,
   jangan pernah hardcode. Kalau fitur baru butuh API key eksternal lain,
   ikutin pola yang sama.
6. **Dark mode**, sudah jalan lewat `next-themes` + class `.dark` di html.
   Setiap komponen baru wajib punya varian dark mode, jangan cuma light mode.

## Yang sudah selesai (Fase 1)

- Landing page (Navbar, Hero dengan animasi uap kopi, PromoBanner,
  rekomendasi produk, footer)
- Dark mode toggle
- Login & register pakai Firebase Auth (email/password + Google Sign-In),
  lewat `AuthForm.tsx`
- Halaman `/menu` nampilin katalog produk dengan filter kategori, tapi masih
  dari data dummy (`src/lib/dummy-products.ts`), belum konek Firestore
- Keranjang belanja (`/keranjang`) dan riwayat pesanan (`/pesanan`) udah
  jalan lewat `CartContext`, TAPI masih disimpen di localStorage browser,
  BUKAN Firestore. Data ilang kalau ganti browser/device. Migrasi ke
  Firestore collection `orders` masih di-checklist Fase 3
- Build & lint bersih, gak ada error

## Yang BELUM ada, jangan diasumsikan sudah ada

- Keranjang belanja & checkout (Fase 3)
- Data produk di Firestore (masih dummy)
- Sistem rating yang beneran nyimpen ke database
- Reservasi meja
- Dashboard admin
- Firestore Security Rules (belum dipasang sama sekali, WAJIB sebelum
  fitur nulis-data mana pun di-deploy publik)
- Payment gateway beneran (rencananya cuma simulasi status "sudah dibayar")

## Kalau nambah fitur baru, checklist-nya

- [ ] Cek `docs/DATA_MODEL.md`, apakah collection Firestore yang dibutuhin
      udah didefinisiin, kalau belum, tambahin definisinya dulu
- [ ] Pastiin komponen baru punya varian dark mode
- [ ] Teks yang keliatan user pakai Bahasa Indonesia
- [ ] Kalau fitur butuh akses tulis ke Firestore, cek Security Rules-nya
- [ ] Update status di `docs/ROADMAP.md` kalau fase selesai
- [ ] Jalanin `npm run lint` dan `npm run build` sebelum dianggap kelar
