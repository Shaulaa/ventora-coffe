# Roadmap, Ventora Coffee

Status per fase. Update centang di sini tiap fase kelar, biar gampang
lanjutin tanpa nanya ulang "udah sampe mana".

## Fase 1, Fondasi ✅ selesai

- [x] Setup Next.js + TypeScript + Tailwind v4
- [x] Design system (warna, tipografi, signature element)
- [x] Landing page (Navbar, Hero, PromoBanner, rekomendasi produk, footer)
- [x] Dark mode toggle
- [x] Firebase Auth, login & register (email/password)
- [x] Halaman `/menu` dengan data dummy

## Fase 2, Menu & Katalog ✅ selesai

- [x] Bikin collection `products` di Firestore (lihat `docs/DATA_MODEL.md`)
- [x] Migrasi `/menu` dari data dummy ke query Firestore
- [x] Halaman detail produk (`/menu/[id]`)
- [x] Sistem rating (Rating.tsx: RatingDisplay, RatingStars, RatingBar, RatingForm)
- [x] Form review (ReviewForm.tsx)
- [x] Firestore helper functions ([firestore-products.ts](src/lib/firestore-products.ts))
- [x] ProductCard kompatibel dengan Firestore product
- [x] Firestore Security Rules ([firestore.rules](firestore.rules))
- [x] ProductCard update ratingAverage/ratingCount dari dummy `rating` ke Firestore `ratingAverage`

Catatan: Data produkmasih perlu di-migrate manual dari dummy ke Firestore. Kode sudah siap.

## Fase 3, Transaksi ✅ selesai

- [x] Context/state keranjang belanja ([`CartContext`](src/context/CartContext.tsx)), persist ke localStorage + Firestore
- [x] Halaman keranjang ([/keranjang](src/app/keranjang/page.tsx)), tambah/kurang qty, hapus item
- [x] Checkout, tulis ke collection `orders` di Firestore
- [x] Halaman history & status order ([/pesanan](src/app/pesanan/page.tsx)), baca dari localStorage + Firestore

Catatan: Checkout sekarang menyimpan ke Firestore. Order lama masih di localStorage (backward compatible).

## Fase 4, Reservasi & Promo ✅ selesai

- [x] Form reservasi meja ([`ReservationForm.tsx`](src/components/ReservationForm.tsx)), tulis ke collection `reservations` dengan userId asli dari Auth (login wajib)
- [x] Halaman reservasi ([/reservasi](src/app/reservasi/page.tsx)) dengan form lengkap + daftar "Reservasi Saya" real-time
- [x] User bisa membatalkan reservasi miliknya sendiri ([`MyReservations.tsx`](src/components/MyReservations.tsx))
- [x] Admin kelola reservasi real-time: Konfirmasi / Tolak / Selesai ([`admin/reservations/page.tsx`](src/app/admin/reservations/page.tsx))
- [x] Promo banner dari Firestore ([`PromoBanner.tsx`](src/components/PromoBanner.tsx), [`firestore-promos.ts`](src/lib/firestore-promos.ts))
- [x] Rekomendasi menu dari Firestore rating ([`getRecommendedProducts`](src/lib/firestore-products.ts))

Files:
- [`src/lib/firestore-reservations.ts`](src/lib/firestore-reservations.ts) - Helper functions + subscriber real-time untuk reservations
- [`src/lib/firestore-promos.ts`](src/lib/firestore-promos.ts) - Helper functions untuk promos
- [`src/components/ReservationForm.tsx`](src/components/ReservationForm.tsx) - Form reservasi lengkap (wired ke Auth)
- [`src/components/MyReservations.tsx`](src/components/MyReservations.tsx) - Daftar reservasi user + tombol batalkan
- [`src/app/reservasi/page.tsx`](src/app/reservasi/page.tsx) - Halaman reservasi
- [`src/app/admin/reservations/page.tsx`](src/app/admin/reservations/page.tsx) - Panel admin kelola reservasi
- [`src/app/page.tsx`](src/app/page.tsx) - Updated untuk menggunakan Firestore recommendations

## Fase 5, Dashboard Admin ✅ selesai

- [x] Halaman `/admin` dengan proteksi role ([`admin/layout.tsx`](src/app/admin/layout.tsx))
- [x] Dashboard utama dengan stats ([`admin/page.tsx`](src/app/admin/page.tsx))
- [x] Manajemen produk ([`admin/products/page.tsx`](src/app/admin/products/page.tsx))
- [x] Manajemen pesanan ([`admin/orders/page.tsx`](src/app/admin/orders/page.tsx), [`admin/orders/[id]/page.tsx`](src/app/admin/orders/[id]/page.tsx))
- [x] Manajemen review ([`admin/reviews/page.tsx`](src/app/admin/reviews/page.tsx))

Files baru:
- [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) - Layout admin dengan auth check
- [`src/app/admin/page.tsx`](src/app/admin/page.tsx) - Dashboard dengan stats card
- [`src/app/admin/products/page.tsx`](src/app/admin/products/page.tsx) - CRUD products
- [`src/app/admin/orders/page.tsx`](src/app/admin/orders/page.tsx) - List orders
- [`src/app/admin/orders/[id]/page.tsx`](src/app/admin/orders/[id]/page.tsx) - Order detail + update status
- [`src/app/admin/reviews/page.tsx`](src/app/admin/reviews/page.tsx) - List reviews

## Prasyarat sebelum go-live/publik

- [ ] Firestore Security Rules terpasang lengkap (lihat `docs/DATA_MODEL.md`)
- [ ] Environment variable production diisi di Vercel (bukan cuma `.env.local`)
- [ ] Testing manual tiap flow, register sampai order selesai
- [ ] Custom domain (opsional, tapi lebih profesional)
