# Todo: Homepage Modern (Premium Urban Cafe)

Spec: `SPEC.md` · Plan: `tasks/plan.md`

- [x] 1. Foundation: token `--font-serif` + util premium di `globals.css`
- [x] 2. Hero premium (`Hero.tsx`) — headline serif, indikator buka pill, cangkir line-art + uap
- [x] 3. TrustStrip baru (`TrustStrip.tsx`)
- [x] 4. ProductCard restyle premium (`ProductCard.tsx`) — cart tetap jalan, rapi di homepage & /menu
- [x] 5. CraftSection baru (`CraftSection.tsx`)
- [x] 6. PromoBanner restyle (`PromoBanner.tsx`)
- [x] 7. Delivery + Community polish
- [x] 8. SiteFooter baru (`SiteFooter.tsx`)
- [x] 9. Rangkai ulang `page.tsx`
- [x] 10. Verify pass: lint bersih, build sukses, runtime 200, cart tidak regresi
- [x] 11. Docs update `docs/DESIGN_SYSTEM.md` (token serif, arah premium, signature element)

## Verifikasi akhir

- `npm run lint` → bersih (agent-skills di-ignore sebagai vendored tooling).
- `npm run build` → sukses; semua route prerender static, TypeScript lolos.
- Runtime: homepage & /menu HTTP 200, tanpa error overlay, semua section baru render.

## Bug yang ditemukan & diperbaiki saat verify

- `lucide-react@1.24.0` tidak punya icon `Instagram` → diganti `AtSign` di `SiteFooter`.
- Dev server (Windows/OneDrive) mengunci `.next` → build EPERM; diselesaikan dengan
  stop dev server + hapus `.next` sebelum build, lalu dev server di-restart.
- ESLint sebelumnya ikut men-scan `agent-skills/**` → ditambahkan ke ignore.

## Catatan untuk sesi berikutnya

- Belum di-commit (repo `.git` project saat ini kosong / belum ter-init).
- Testing framework belum ada; nambah butuh approval (boundary di SPEC.md).
