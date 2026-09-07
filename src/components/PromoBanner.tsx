import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActivePromos } from "@/lib/firestore-promos";

type Promo = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
};

async function PromoBanner() {
  const promos = await getActivePromos();
  const activePromo = promos[0];

  // Fallback ke promo dummy jika belum ada di Firestore
  const fallbackPromo: Promo = {
    id: "promo-1",
    title: "Beli 2 gratis 1 untuk menu Signature",
    description: "Berlaku Senin–Rabu, pukul 08.00–11.00. Tunjukkan halaman ini di kasir.",
  };

  const promo = activePromo || fallbackPromo;

  return (
    <section className="mx-auto max-w-screen-xl px-6">
      <div className="relative overflow-hidden rounded-3xl border border-espresso/10 bg-espresso px-8 py-10 text-paper dark:border-paper/10 dark:bg-espresso-light md:px-12 md:py-12">
        {/* aksen garis halus */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-amber/20" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-40 w-40 rounded-full border border-amber/10" />

        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="font-data text-[11px] uppercase tracking-[0.28em] text-amber">
              Promo minggu ini
            </p>
            <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
              {promo.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-paper/70">
              {promo.description}
            </p>
          </div>
          <Link
            href="/menu"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-medium text-espresso transition-colors hover:bg-paper"
          >
            Lihat menu Signature
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PromoBanner;
