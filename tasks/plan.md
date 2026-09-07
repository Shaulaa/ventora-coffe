# Plan: Homepage Modern (Premium Urban Cafe), Ventora Coffee

Spec source: `docs/development/SPEC.md`

## Strategy

Redesign in-place, vertical slices per section. Tiap slice: implement → cek
`npm run lint` → lanjut. Build penuh (`npm run build`) di checkpoint besar.
Tidak nambah dependency, tidak nyentuh Firestore. Data tetap dummy.

## Foundation dulu

Token & primitives dipakai semua section, jadi didahulukan:
- Tambah `--font-serif: "Fraunces"` ke `@theme` di `globals.css` (Fraunces sudah
  dimuat di layout, tinggal expose jadi util `font-serif`).
- Tambah util premium seperlunya (mis. `.eyebrow` opsional) tanpa over-engineering.

## Task order (dependency-aware)

1. Foundation: token serif + util premium (`globals.css`).
2. Hero premium (`Hero.tsx`).
3. TrustStrip baru (`TrustStrip.tsx`).
4. ProductCard restyle premium (`ProductCard.tsx`) — hati-hati, dipakai `/menu` juga.
5. CraftSection baru (`CraftSection.tsx`).
6. PromoBanner restyle (`PromoBanner.tsx`).
7. Delivery + Community polish (`DeliveryBadges.tsx`, `CommunityCarousel.tsx`).
8. SiteFooter baru (`SiteFooter.tsx`).
9. Rangkai ulang `page.tsx` (urutan section + spacing rhythm).
10. Verify pass: lint + build + a11y/responsive checklist.
11. Docs: update `docs/DESIGN_SYSTEM.md` (token serif, arah premium, signature note).

## Dependencies

- Task 1 sebelum semua (token dipakai Hero, Craft, dll).
- Task 4 (ProductCard) sebelum kepasang rapi di page, tapi bisa jalan mandiri.
- Task 9 (page.tsx) setelah komponen section siap.
- Task 10 setelah semua UI settle.
- Task 11 terakhir (refleksikan state final).

## Risks & mitigation

- **ProductCard dipakai 2 tempat** → restyle harus tetap enak di grid `/menu`;
  cek dua-duanya. Jangan ubah props/logika cart.
- **Signature element (papan kayu) vs premium** → reinterpretasi jadi indikator
  "buka" minimalis; catat keputusan di DESIGN_SYSTEM.md, jangan diam-diam.
- **Font serif global** → hanya expose token; komponen lama tetap pakai Baloo,
  tidak ada regresi tipografi di halaman lain.
- **Terlalu banyak file sekaligus** → verifikasi lint tiap beberapa slice.

## Verification checkpoints

Tiap task: `npm run lint`.
Checkpoint besar (setelah task 9): `npm run build`.
Manual: 320/390/768/1024/1440px, keyboard nav, dark/light, cart tidak regresi.

## Definition of done

- Lint bersih, build sukses.
- Homepage terasa premium urban, konsisten light/dark.
- Tidak ada horizontal overflow di lebar mobile umum.
- Cart button masih berfungsi (badge Navbar naik).
- DESIGN_SYSTEM.md sinkron dengan hasil akhir.
