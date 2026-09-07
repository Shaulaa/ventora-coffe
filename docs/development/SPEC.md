# Spec: Homepage Modern, Ventora Coffee

Feature scope: redesign homepage (`/`) jadi terasa **premium urban cafe**, in-place
(rombak `src/app/page.tsx` + komponen yang dipakai homepage). Stack & aturan baku
project tetap (lihat `CLAUDE.md`). Dokumen ini ngikutin format spec-driven-development
dari agent-skills: objective, commands, structure, code style, testing, boundaries.

## 1. Objective

Menaikkan homepage Ventora dari landing playful jadi homepage coffeeshop yang
terasa **premium, tenang, dan kredibel** — banyak whitespace, tipografi tegas
(serif display), kontras terkontrol, aksen warna minimal. Target: layak jadi
portofolio frontend yang "terasa mahal", bukan generic/AI-slop.

Target user:
- Calon pelanggan yang menilai kredibilitas coffeeshop dalam 5 detik pertama.
- Recruiter/reviewer portofolio yang menilai kualitas visual & struktur kode.

Keputusan arah (dikonfirmasi user):
- **Arah visual:** Premium urban cafe.
- **Pendekatan:** Redesign in-place (satu homepage final, bukan berdampingan).

## 2. Acceptance criteria (per section)

Homepage terdiri dari section berurutan berikut. Semua wajib light + dark mode,
responsif tanpa horizontal scroll di 320/390/768/1024/1440px, teks Bahasa Indonesia.

1. **Hero** — headline serif besar (Fraunces), eyebrow mono, subcopy ringkas,
   dual CTA (Pesan / Reservasi), visual kopi elegan (line-art SVG, bukan kartun),
   dan status "buka" yang direinterpretasi versi premium (bukan papan kayu miring).
2. **Trust strip** — baris statistik/kredibilitas ringkas (rating, jam buka,
   "diseduh segar") dengan tipografi mono, pemisah halus.
3. **Featured menu** — grid "Menu andalan" pakai `ProductCard` yang di-restyle
   premium (border tipis, kalem, tetap punya tombol Tambah ke keranjang yang jalan).
4. **Craft/About** — section editorial "Tentang Ventora" whitespace lega,
   2 kolom (teks + visual/point-of-difference), menegaskan cerita brand.
5. **Promo** — `PromoBanner` di-restyle premium (kalem, bukan blok sage tabrakan).
6. **Delivery** — `DeliveryBadges`, polish minor biar konsisten.
7. **Testimoni** — `CommunityCarousel`, polish premium.
8. **Footer** — footer penuh (navigasi + info jam/kontak fiktif), bukan 1 baris.

Definisi "selesai" untuk fitur ini:
- `npm run lint` bersih, `npm run build` sukses.
- Tidak ada horizontal scroll di lebar mobile umum.
- Semua kontrol interaktif punya accessible name & focus state kelihatan.
- Tombol "Tambah" tetap menambah item ke `CartContext` (tidak regresi).
- `docs/DESIGN_SYSTEM.md` diupdate kalau ada aturan visual/token yang berubah.

## 3. Commands

```bash
npm run dev     # dev server (Windows: bisa perlu npm.cmd run dev)
npm run lint    # ESLint (harus bersih sebelum selesai)
npm run build   # production build (harus sukses sebelum selesai)
```

## 4. Project structure (file yang disentuh)

```
src/app/page.tsx            -> rangkai ulang urutan & wrapper section homepage
src/app/globals.css         -> tambah token font serif + util premium seperlunya
src/components/Hero.tsx      -> redesign premium
src/components/ProductCard.tsx -> restyle premium (dipakai homepage + /menu)
src/components/PromoBanner.tsx  -> restyle premium
src/components/DeliveryBadges.tsx -> polish
src/components/CommunityCarousel.tsx -> polish
src/components/TrustStrip.tsx   -> BARU: baris statistik kredibilitas
src/components/CraftSection.tsx -> BARU: section editorial about/craft
src/components/SiteFooter.tsx   -> BARU: footer penuh (reusable)
```

Tidak menambah dependency baru. Tidak menyentuh Firestore. Data produk tetap dari
`src/lib/dummy-products.ts`. Navbar tidak dirombak (dipakai semua halaman; di luar
scope), kecuali perbaikan kecil non-breaking bila perlu.

## 5. Code style

- Ikuti pola komponen yang ada: server component default, `"use client"` hanya
  bila butuh state/browser API (mis. ProductCard yang pakai `useCart`).
- Pakai token design system: `background`, `foreground`, `surface`, `border-soft`,
  `sage`, `amber`, `rust`, `espresso`, `paper`. Aksen premium: kurangi tumpukan
  warna, satu aksen per elemen (aturan Design System).
- Tipografi premium: headline pakai serif Fraunces via token baru `--font-serif`;
  eyebrow/angka pakai `font-data` (mono) uppercase tracking lebar; body `font-body`.
- Ikon pakai `lucide-react` (sudah ada), bukan emoji, untuk elemen UI premium.
- Setiap section: full-width wrapper + inner `max-w-6xl` konsisten.
- Reduced motion: animasi non-esensial wajib punya fallback `prefers-reduced-motion`.

## 6. Testing strategy

Project ini **belum punya test framework**, dan menambah framework (Jest/Vitest/
Playwright) butuh persetujuan eksplisit (boundary di `docs/WEB_PROFESSIONAL_SPEC.md`).
Homepage ini murni presentational; tidak ada logika baru non-trivial yang layak
unit-test. Jadi bukti (proof) untuk fitur ini:

- `npm run lint` bersih.
- `npm run build` sukses.
- Manual QA responsif di 320/390/768/1024/1440px.
- Keyboard-only smoke test: semua CTA, tombol, dan link kejangkau + focus terlihat.
- Cek dark & light mode kontras terbaca.
- Regresi keranjang: klik "Tambah" pada featured menu menaikkan badge Navbar.

Kalau nanti logika (cart math, formatting) tumbuh, baru ajukan Vitest secara
terpisah. Tidak menambah framework diam-diam.

## 7. Boundaries

Always:
- Pertahankan Next.js App Router, TypeScript, Tailwind v4, Firebase, next-themes.
- Teks UI Bahasa Indonesia; komponen baru responsif + dark mode.
- `npm run lint` & `npm run build` sebelum dianggap selesai.
- Update `docs/DESIGN_SYSTEM.md` bila aturan visual berubah.

Ask first:
- Menambah dependency apa pun.
- Menyentuh data model Firestore / security.
- Menambah gambar eksternal, analytics, atau API pihak ketiga.
- Menambah framework testing.

Never:
- Commit `.env.local` atau hardcode secret.
- Edit `node_modules` atau `agent-skills/`.
- Mengganti backend Firebase tanpa persetujuan.
- Menyembunyikan flow rusak di balik fake success.

## 8. Out of scope

- Redesign Navbar, halaman `/menu`, auth pages (fokus homepage saja).
- Koneksi Firestore / migrasi data produk (itu Fase 2 di roadmap).
- Gambar produk/ambiance asli (pakai SVG/line-art dulu).
- Payment, admin, reservasi fungsional.
