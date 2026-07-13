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

## Fase 2, Menu & Katalog, belum dimulai

- [ ] Bikin collection `products` di Firestore (lihat `docs/DATA_MODEL.md`)
- [ ] Migrasi `/menu` dari data dummy ke query Firestore
- [ ] Halaman detail produk
- [ ] Sistem rating, form kasih review + tampilan review yang udah ada
- [ ] Update `ratingAverage`/`ratingCount` tiap ada review baru

## Fase 3, Transaksi, sebagian jalan (masih localStorage, belum Firestore)

- [x] Context/state keranjang belanja (`CartContext`), persist ke localStorage
- [x] Halaman keranjang (`/keranjang`), tambah/kurang qty, hapus item
- [x] Checkout, simulasi (`checkout()` push ke state orders lokal), BELUM tulis ke Firestore
- [x] Halaman history & status order (`/pesanan`), baca dari localStorage
- [ ] Migrasi `checkout()` dan `orders` dari localStorage ke collection `orders` di
      Firestore, biar data gak ilang kalau ganti device/browser

## Fase 4, Reservasi & Promo, belum dimulai

- [ ] Form reservasi meja, tulis ke collection `reservations`
- [ ] Halaman lihat status reservasi milik user
- [ ] Promo banner konek ke collection `promos` (bukan data statis lagi)
- [ ] Rekomendasi menu berdasarkan data asli (rating tertinggi dari Firestore,
      bukan array dummy yang di-sort manual)

## Fase 5, Dashboard Admin, belum dimulai

- [ ] Halaman `/admin`, dilindungi, cuma bisa diakses `role == "admin"`
- [ ] CRUD produk (tambah, edit, hapus, upload foto)
- [ ] Kelola pesanan masuk, update status order
- [ ] Kelola reservasi (konfirmasi/tolak)
- [ ] Kelola promo banner
- [ ] Lihat semua review yang masuk

## Prasyarat sebelum go-live/publik

- [ ] Firestore Security Rules terpasang lengkap (lihat `docs/DATA_MODEL.md`)
- [ ] Environment variable production diisi di Vercel (bukan cuma `.env.local`)
- [ ] Testing manual tiap flow, register sampai order selesai
- [ ] Custom domain (opsional, tapi lebih profesional)
