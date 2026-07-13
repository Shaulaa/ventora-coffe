import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ReservasiPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
            Reservasi meja
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Segera hadir di Fase 4
          </h1>
          <p className="mt-5 text-base leading-7 text-foreground/70">
            Form reservasi dan status meja masih disiapkan. Untuk sekarang,
            kamu bisa jelajahi menu digital dulu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-espresso dark:hover:bg-amber dark:hover:text-espresso"
            >
              <CalendarDays aria-hidden="true" size={16} />
              Lihat Menu
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border-soft px-6 py-3 text-sm font-semibold transition-colors hover:border-amber hover:bg-surface"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
