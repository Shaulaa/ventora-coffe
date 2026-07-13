# Spec: Web Professional Standard, Ventora Coffee

## Assumptions

1. Ventora Coffee tetap web application, bukan native mobile app.
2. Stack tidak berubah: Next.js App Router, TypeScript, Tailwind CSS v4, Firebase Auth, dan Firestore.
3. Target utama adalah portfolio project yang terasa seperti aplikasi coffeeshop sungguhan.
4. Bahasa UI tetap Bahasa Indonesia.
5. Improvement tahap ini fokus ke standar web profesional: UX, responsive layout, accessibility, performance, visual consistency, dan readiness untuk fitur transaksi/reservasi.
6. Fitur besar baru seperti payment gateway, admin dashboard lengkap, dan Cloud Functions tidak dikerjakan di scope ini kecuali dibuat sebagai fondasi/spec.

## Objective

Menaikkan kualitas Ventora Coffee dari demo belajar menjadi web coffeeshop yang lebih profesional, kredibel, responsif, dan siap dikembangkan ke fase produk.

Pengguna utama:

- Customer yang ingin melihat menu, login, reservasi, dan nantinya checkout.
- Pemilik/admin coffeeshop yang nantinya mengelola produk, pesanan, reservasi, dan promo.
- Recruiter atau reviewer portfolio yang menilai kualitas frontend, struktur kode, dan product thinking.

Masalah yang ingin diselesaikan:

- Tampilan tidak boleh terasa generik atau "AI slop".
- Desktop harus terasa full-screen, matang, dan punya visual hierarchy jelas.
- Mobile harus nyaman dipakai, dengan navigasi hamburger di kanan dan layout tanpa overflow.
- Aplikasi harus punya standar aksesibilitas dasar.
- Kode UI harus konsisten, mudah dirawat, dan siap untuk fitur Firestore berikutnya.

## Tech Stack

- Next.js 16.2.10, App Router
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Firebase 12.16.0
- next-themes untuk dark mode
- lucide-react untuk ikon UI
- ESLint dengan konfigurasi Next.js

## Commands

Dev server:

```bash
npm.cmd run dev
```

Lint:

```bash
npm.cmd run lint
```

Production build:

```bash
npm.cmd run build
```

Install dependency:

```bash
npm install
```

Catatan Windows PowerShell:

```bash
npm.cmd run dev
```

Dipakai karena `npm run dev` bisa tertahan Execution Policy PowerShell.

## Project Structure

```text
src/app/
  layout.tsx        -> Root layout, metadata, font loading, providers
  globals.css       -> Design tokens, global CSS, reusable visual primitives
  page.tsx          -> Landing page
  menu/page.tsx     -> Menu catalog page
  login/page.tsx    -> Login route
  register/page.tsx -> Register route

src/components/
  Navbar.tsx        -> Navigation, auth state, mobile menu
  Hero.tsx          -> First viewport brand experience
  PromoBanner.tsx   -> Promotional band
  ProductCard.tsx   -> Product catalog card
  AuthForm.tsx      -> Login/register form
  ThemeToggle.tsx   -> Dark mode control
  ThemeProvider.tsx -> next-themes provider

src/context/
  AuthContext.tsx   -> Firebase auth state

src/lib/
  firebase.ts       -> Firebase initialization
  dummy-products.ts -> Temporary product data until Firestore migration

docs/
  DESIGN_SYSTEM.md              -> Current visual design rules
  DATA_MODEL.md                 -> Firestore schema
  ROADMAP.md                    -> Product phase tracking
  WEB_PROFESSIONAL_SPEC.md      -> This spec
```

## Code Style

Component style:

```tsx
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 leading-7 text-foreground/70">{description}</p>
      ) : null}
    </div>
  );
}
```

Conventions:

- Use TypeScript props types for reusable components.
- Use Bahasa Indonesia for visible UI text.
- Use `lucide-react` icons for common controls.
- Use existing tokens: `background`, `foreground`, `surface`, `border-soft`, `sage`, `amber`, `rust`, `espresso`.
- Every new UI surface must work in light and dark mode.
- Avoid unnecessary dependencies.
- Avoid one-off inline styles unless they are needed for animation or dynamic values.
- Avoid large decorative cards inside other cards.
- Prefer full-width sections with constrained inner content for page structure.

## Testing Strategy

Current available checks:

- Lint with `npm.cmd run lint`.
- Production build with `npm.cmd run build`.
- Manual browser checks on desktop and mobile widths.

Required manual checks for this improvement:

- Desktop width 1440px: hero fills first viewport and content does not feel narrow.
- Tablet width 768px: navigation, hero, promo, and product grid do not overlap.
- Mobile width 390px: hamburger is visible on the right, menu opens cleanly, no horizontal scroll.
- Light and dark modes both have readable contrast.
- Keyboard navigation can reach nav links, theme toggle, CTA buttons, auth forms, and product buttons.
- Reduced motion users do not get essential UI hidden behind animations.

Future recommended automated checks:

- Add Playwright for visual and responsive smoke tests.
- Add accessibility smoke test with `@axe-core/playwright`.
- Add unit tests for formatting/helpers when product and cart logic grows.

## Boundaries

Always:

- Keep Next.js App Router, TypeScript, Tailwind v4, Firebase, and next-themes.
- Keep UI text in Bahasa Indonesia.
- Keep new components responsive and dark-mode compatible.
- Run `npm.cmd run lint` and `npm.cmd run build` before marking implementation done.
- Update relevant docs when behavior, data model, or roadmap changes.

Ask first:

- Adding new dependencies.
- Changing Firebase data model or security assumptions.
- Adding payment provider, upload service, analytics, or third-party API.
- Replacing the design direction or color system.
- Introducing a new testing framework.

Never:

- Commit `.env.local` or hardcode Firebase/API secrets.
- Edit `node_modules`.
- Remove Firebase Auth/Firestore in favor of another backend without explicit approval.
- Ship write-to-Firestore features publicly without security rules.
- Hide broken flows behind fake success states.

## Success Criteria

Professional UX:

- Landing page first viewport feels intentional on desktop, not just centered content.
- Mobile navigation is accessible, right-aligned, and does not cause layout shift.
- Product/catalog sections are scannable, with consistent spacing, hierarchy, and CTA behavior.
- Empty or unavailable features communicate status clearly without looking broken.

Responsive quality:

- No horizontal scrolling at 320px, 390px, 768px, 1024px, and 1440px widths.
- Main page sections use stable max widths and predictable spacing.
- Button labels and card text do not overflow their containers.

Accessibility:

- All icon-only buttons have accessible labels.
- Focus states are visible.
- Interactive elements are reachable by keyboard.
- Text contrast remains readable in light and dark modes.
- Motion has reduced-motion fallback.

Performance:

- Production build succeeds.
- Avoid unnecessary client components.
- Avoid large external images or decorative assets until optimized.
- Initial landing page should remain mostly static-renderable.

Maintainability:

- Reusable UI patterns are extracted only when repetition becomes meaningful.
- Firestore-facing features follow `docs/DATA_MODEL.md`.
- Roadmap status stays accurate after completing a phase.

## Proposed Improvement Areas

1. Design polish and layout system
   - Standardize page container sizes.
   - Improve section rhythm.
   - Remove remaining generic visual patterns.
   - Add consistent page headers for `/menu`, auth pages, and future routes.

2. Responsive navigation
   - Make mobile menu robust.
   - Add active link treatment.
   - Ensure auth controls fit on small screens.

3. Product catalog readiness
   - Prepare product card for image support.
   - Add category filters/search UI in `/menu`.
   - Keep dummy data compatible with future Firestore product shape.

4. Trust and conversion
   - Add clearer service information: opening hours, pickup/reservation expectations, order status placeholder.
   - Add professional footer with navigation and contact-style information, while keeping business fictional.

5. Accessibility and quality checks
   - Audit labels, focus states, color contrast, and keyboard behavior.
   - Add manual QA checklist to docs.

6. Firebase readiness
   - Prepare typed Firestore helpers for products.
   - Do not enable write features until security rules are documented and applied.

## Out of Scope For This Spec

- Real payment gateway.
- Full admin dashboard.
- Cloud Functions for rating aggregation.
- Real image upload pipeline.
- Production deployment setup.

## Open Questions

1. Untuk arah visual profesional, kamu lebih mau Ventora terasa:
   - calm specialty coffee,
   - premium urban cafe,
   - cozy neighborhood cafe,
   - atau functional ordering app?
2. Apakah improvement berikutnya langsung fokus landing page dulu, atau sekalian `/menu`, auth pages, dan footer?
3. Untuk menu, apakah produk perlu gambar real/placeholder profesional, atau sementara tetap text-first tanpa gambar?
4. Apakah kita boleh menambah dependency testing seperti Playwright nanti, atau tetap pakai lint/build/manual QA dulu?
5. Apakah standar selesai cukup lokal, atau kamu juga mau siap deploy ke Vercel?

## Review Gate

Spec ini perlu kamu approve sebelum lanjut ke:

1. `tasks/plan.md` untuk rencana teknis.
2. `tasks/todo.md` untuk pecahan task.
3. Implementasi kode.

## Implementation Log

### 2026-07-12

Completed first professional-standard pass:

- Added global focus-visible behavior and mobile tap polish in `src/app/globals.css`.
- Improved landing credibility with an operational service strip and fuller footer in `src/app/page.tsx`.
- Upgraded `/menu` into category-grouped catalog sections with category anchors.
- Polished `AuthForm` fields, button states, autocomplete, accessible icons, and error state.
- Rebuilt `/login` and `/register` as branded responsive auth pages.
- Excluded `agent-skills/**` from app ESLint because it is vendor/tooling code, not Ventora application source.

Verification:

```bash
npm.cmd run lint
npm.cmd run build
```

Both commands passed after implementation.
