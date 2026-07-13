import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-soft bg-paper-dim dark:bg-espresso-light">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Kolom teks */}
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/70 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sage opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
            </span>
            <span className="font-data text-[11px] uppercase tracking-[0.22em] text-foreground/70">
              Buka setiap hari · 08.00–22.00
            </span>
          </span>

          <p className="eyebrow mt-6">Kopi Spesialti · Jakarta Selatan</p>

          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-espresso dark:text-paper sm:text-5xl md:text-6xl">
            Setiap cangkir,
            <br />
            diseduh dengan sengaja.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-foreground/70">
            Ventora Coffee meracik biji pilihan jadi kopi yang tenang dan
            berkarakter. Dibuat segar tiap pesanan, di ruang yang nyaman buat
            kerja, ngobrol, atau sekadar rehat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-rust px-7 py-3 text-sm font-medium text-paper transition-colors hover:bg-rust/90"
            >
              Lihat Menu
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/reservasi"
              className="inline-flex items-center justify-center rounded-full border border-espresso/25 px-7 py-3 text-sm font-medium text-espresso transition-colors hover:border-espresso hover:bg-espresso hover:text-paper dark:border-paper/30 dark:text-paper dark:hover:border-paper dark:hover:bg-paper dark:hover:text-espresso"
            >
              Reservasi Meja
            </Link>
          </div>
        </div>

        {/* Kolom visual, cangkir line-art dengan uap halus */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border-soft bg-surface/60 shadow-sm">
            {/* garis grid halus latar */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-espresso)_1px,transparent_1px),linear-gradient(90deg,var(--color-espresso)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-[0.12]" />

            <svg
              viewBox="0 0 240 240"
              className="absolute inset-0 h-full w-full text-espresso dark:text-paper"
              fill="none"
              aria-hidden="true"
            >
              {/* uap */}
              <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                <path className="steam" style={{ animationDelay: "0s" }} d="M104 70 q-8 -12 0 -24 q8 -12 0 -24" />
                <path className="steam" style={{ animationDelay: "0.8s" }} d="M124 70 q-8 -12 0 -24 q8 -12 0 -24" />
                <path className="steam" style={{ animationDelay: "1.6s" }} d="M144 70 q-8 -12 0 -24 q8 -12 0 -24" />
              </g>
              {/* cangkir */}
              <path d="M70 96 h100 v40 a50 50 0 0 1 -100 0 z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
              <path d="M170 104 h16 a18 18 0 0 1 0 36 h-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              {/* permukaan kopi */}
              <ellipse cx="120" cy="96" rx="50" ry="9" fill="currentColor" opacity="0.14" />
              {/* piring */}
              <path d="M56 196 h128" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
              <ellipse cx="120" cy="196" rx="72" ry="10" stroke="currentColor" strokeWidth="4" opacity="0.35" />
            </svg>

            <span className="absolute bottom-4 left-4 font-data text-[11px] uppercase tracking-[0.2em] text-foreground/50">
              House blend · v.01
            </span>
          </div>
          {/* aksen kartu kecil di belakang */}
          <div className="absolute -right-3 -top-3 -z-10 h-24 w-24 rounded-2xl border border-amber/40 bg-amber/10" />
        </div>
      </div>
    </section>
  );
}
