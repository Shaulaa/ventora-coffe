# Design System, Ventora Coffee

Konsep visual, terinspirasi gaya coffeeshop lokal yang playful dan komunal
(ilustrasi hangat, warna cerah, tipografi chunky), diterjemahkan ulang jadi
identitas orisinal milik Ventora Coffee, bukan reproduksi brand manapun.

## Warna

Didefinisikan sebagai CSS variable di `src/app/globals.css`, dipakein
lewat Tailwind (`bg-espresso`, `text-sage`, dst).

| Token           | Hex       | Pemakaian                                      |
|-----------------|-----------|-------------------------------------------------|
| `espresso`      | `#2B2118` | Teks utama (light mode), background (dark mode) |
| `espresso-light`| `#3D2E20` | Surface/card di dark mode                        |
| `paper`         | `#FFF8EC` | Background utama (light mode)                    |
| `paper-dim`     | `#FBEFDA` | Background hero, section alternating             |
| `sage`          | `#6B7A54` | Aksen sekunder, label kategori, promo banner     |
| `amber`         | `#F2B138` | Papan "buka", highlight kuning playful           |
| `rust`          | `#B23A2E` | CTA utama (tombol Masuk, Tambah ke keranjang)    |

Aturan pemakaian, satu warna aksen per elemen. Jangan tumpuk `rust` dan
`amber` di komponen yang sama kecuali ada alasan hierarki yang jelas
(misal CTA utama rust, papan buka amber).

## Tipografi

Dimuat lewat `<link>` Google Fonts di `src/app/layout.tsx` (bukan
`next/font/google`, karena environment tertentu bisa gagal fetch font
saat build, jadi dimuat langsung di browser).

| Role     | Font            | Variabel CSS     | Dipakai buat                          |
|----------|-----------------|------------------|-----------------------------------------|
| Serif    | Fraunces        | `--font-serif`   | Headline premium (hero, judul section, nama produk), tegas & elegan |
| Display  | Baloo 2         | `--font-display` | Aksen chunky/playful bila diperlukan   |
| Body     | Inter           | `--font-body`    | Paragraf, label, teks UI umum          |
| Data     | JetBrains Mono  | `--font-data`    | Harga, rating, angka, eyebrow text     |

Class Tailwind, `font-serif`, `font-display`, `font-body` (default di body),
`font-data`. Sejak redesign homepage premium (2026-07-13), **headline utama pakai
`font-serif` (Fraunces)**, bukan Baloo 2 lagi. Baloo 2 tetap tersedia lewat
`font-display` untuk aksen playful, tapi bukan default judul.

Ada juga class utility `.eyebrow` (di `globals.css`) untuk label kecil uppercase
mono warna sage, biar konsisten lintas section.

## Signature element

Papan kayu "Buka Setiap Hari" yang digantung miring di atas hero, plus
ilustrasi barista sederhana (SVG custom, bukan gambar/ilustrasi generik).
Ini elemen yang paling "Ventora Coffee", dipertahankan konsisten kalau
butuh elemen dekoratif serupa di halaman lain.

> **Update 2026-07-13 (redesign homepage premium).** Untuk arah "premium urban
> cafe", papan kayu miring + barista kartun di hero **diganti** jadi versi yang
> lebih tenang: indikator "Buka · 08.00–22.00" berbentuk pill minimalis dengan
> titik status, dan visual cangkir kopi line-art (SVG) dengan uap halus
> (animasi `.steam`, ada fallback `prefers-reduced-motion`). Keputusan ini
> sengaja mengutamakan arah premium di atas elemen playful lama. Kalau nanti
> butuh nuansa playful lagi (mis. halaman promo), papan kayu boleh dihidupkan
> kembali sebagai aksen, bukan sebagai hero utama.

Prinsip, satu signature element yang menonjol per halaman, sisanya tenang.

## Komponen dasar yang udah ada

- `Navbar`, sticky top, ada status login (tombol Masuk/Keluar dinamis),
  ThemeToggle, responsive (hamburger menu di mobile)
- `ThemeToggle`, saklar custom (bukan icon matahari/bulan generik doang),
  posisi geser kayak switch fisik
- `Hero`, versi premium: indikator buka pill + headline serif + CTA ganda +
  visual cangkir line-art (SVG) dengan uap halus
- `TrustStrip`, baris statistik kredibilitas (rating, jam, dll) di bawah hero
- `PromoBanner`, kartu promo premium (background espresso, aksen amber)
- `ProductCard`, kartu premium (tile icon, nama serif, tombol Tambah ke
  keranjang), dipakai di landing (rekomendasi) dan halaman menu
- `CraftSection`, section editorial "Tentang Ventora" (2 kolom, point-of-difference)
- `CategoryTabs`, filter kategori menu berbentuk pill, dipakai di `/menu`
- `DeliveryBadges`, badge platform delivery (GoFood, GrabFood, ShopeeFood)
- `CommunityCarousel`, carousel cerita pelanggan (data dummy)
- `SiteFooter`, footer penuh (brand + navigasi + info kunjungi/kontak fiktif)

## Prinsip yang harus dipegang buat komponen baru

1. Jangan pakai border-radius besar sembarangan, ikutin skala yang udah
   ada (`rounded-full` buat tombol/badge, `rounded-2xl` buat card)
2. Border pakai `border-border-soft`, bukan warna abu-abu Tailwind default
3. Hover state sebaiknya perubahan warna border atau opacity, bukan shadow
   besar atau scale yang berlebihan
4. Setiap teks yang butuh label kategori/eyebrow, formatnya uppercase,
   ukuran kecil, tracking lebar, font `font-data`, warna `sage`
5. Reduced motion, animasi yang gak esensial (kayak uap kopi) wajib
   punya fallback `prefers-reduced-motion`, contohnya udah ada di `Hero.tsx`
