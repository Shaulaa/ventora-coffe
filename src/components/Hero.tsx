"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
    setIsMobile(window.innerWidth < 1024);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
      setIsMobile(window.innerWidth < 1024);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", () => setIsMobile(window.innerWidth < 1024));
    return () => observer.disconnect();
  }, []);

  const getImageSrc = () => {
    if (!mounted) return "/img/hero-mb-light.png";
    if (isMobile) {
      return isDark ? "/img/hero-mb-dark.png" : "/img/hero-mb-light.png";
    }
    return isDark ? "/img/hero-dark.png" : "/img/hero-light.png";
  };

  return (
    <section className="relative min-h-[550px] overflow-hidden md:min-h-[650px]">
      {/* Background Image - center crop */}
      <div className="absolute inset-0">
        <Image
          src={getImageSrc()}
          alt=""
          fill
          className="object-cover object-center md:object-[center_25%]"
          priority
        />
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/60 to-transparent dark:from-espresso/90 dark:via-espresso/60 dark:to-transparent" />
      </div>

      {/* Content - aligned with page container */}
      <div className="relative flex min-h-[550px] items-center md:min-h-[650px]">
        <div className="mx-auto w-full max-w-screen-xl px-6 md:px-10">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-espresso/70 dark:text-paper/70 md:text-base">
              Kopi Spesialti · Jakarta Selatan
            </p>

            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-espresso dark:text-paper md:text-5xl lg:text-6xl">
              Setiap cangkir,
              <br />
              diseduh dengan sengaja.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso/70 md:text-base dark:text-paper/70">
              Ventora Coffee meracik biji pilihan jadi kopi yang tenang dan
              berkarakter. Dibuat segar tiap pesanan, di ruang yang nyaman buat
              kerja, ngobrol, atau sekadar rehat.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rust px-8 py-3 text-sm font-semibold text-paper transition-colors hover:bg-rust/90 md:text-base md:py-4"
              >
                Lihat Menu
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="/reservasi"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-espresso/30 bg-surface/80 px-8 py-3 text-sm font-semibold text-espresso backdrop-blur-sm transition-colors hover:border-espresso hover:bg-espresso hover:text-paper dark:border-paper/30 dark:bg-espresso/80 dark:text-paper dark:hover:border-paper dark:hover:bg-paper dark:hover:text-espresso md:text-base md:py-4"
              >
                Reservasi Meja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
