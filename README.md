# Ventora Coffee

Aplikasi web coffee shop modern untuk katalog menu, pemesanan, pembayaran, reservasi, dan pengelolaan operasional.

## Fitur

- Katalog menu dan detail produk berbasis Firestore
- Autentikasi Firebase: email/password dan Google Sign-In
- Keranjang, checkout, riwayat pesanan, serta pelacakan status pembayaran
- Pembayaran Midtrans Snap
- Reservasi meja dan pembatalan reservasi oleh pelanggan
- Dark mode dan antarmuka responsif
- Dashboard admin untuk pesanan, reservasi, produk, promo, ulasan, dan pengguna

## Teknologi

- Next.js 16 (App Router), React 19, dan TypeScript
- Tailwind CSS 4
- Firebase Authentication dan Cloud Firestore
- Midtrans Snap

## Menjalankan secara lokal

1. Instal dependensi:

   ```bash
   npm install
   ```

2. Buat `.env.local` dan isi konfigurasi Firebase serta kredensial Midtrans. Lihat `.env.local.example` dan panduan di `FIREBASE_SETUP.md` serta `PAYMENT_SETUP.md`.

3. Aktifkan metode login Email/Password dan Google di Firebase Authentication, lalu buat database Firestore.

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Konfigurasi Firebase

Konfigurasi deployment Firebase tersedia di `firebase.json`, dengan Security Rules pada `firestore.rules` dan indeks pada `firestore.indexes.json`. Deploy aturan dan indeks sebelum membuka aplikasi ke publik.

## Struktur proyek

```
src/
  app/          halaman, API routes, dan dashboard admin
  components/   komponen UI
  context/      state autentikasi dan keranjang
  lib/          Firebase, Firestore, dan integrasi pembayaran
  scripts/      utilitas migrasi data dan pembuatan admin
```

## Dokumentasi

- `FIREBASE_SETUP.md` — setup Firebase dan Firestore
- `PAYMENT_SETUP.md` — setup pembayaran Midtrans
- `docs/DATA_MODEL.md` — skema data Firestore
- `docs/DESIGN_SYSTEM.md` — panduan visual

## Keamanan

- Jangan commit `.env.local` atau kredensial lain.
- Terapkan `firestore.rules` sebelum deployment produksi.
