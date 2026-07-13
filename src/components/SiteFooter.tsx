import Link from "next/link";
import { MapPin, Clock, AtSign } from "lucide-react";

const jelajah = [
  { href: "/menu", label: "Menu" },
  { href: "/reservasi", label: "Reservasi" },
  { href: "/pesanan", label: "Pesanan Saya" },
  { href: "/keranjang", label: "Keranjang" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-paper-dim dark:bg-espresso-light">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-serif text-xl font-semibold tracking-tight">
              Ventora Coffee
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-foreground/60">
              Kopi spesialti yang diseduh dengan sengaja. Ruang tenang buat kerja,
              ngobrol, dan rehat.
            </p>
          </div>

          {/* Jelajah */}
          <nav aria-label="Tautan halaman">
            <p className="eyebrow">Jelajah</p>
            <ul className="mt-4 space-y-2.5">
              {jelajah.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-amber"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kunjungi */}
          <div>
            <p className="eyebrow">Kunjungi</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                Jl. Kenanga No. 12, Jakarta Selatan
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                Setiap hari, 08.00–22.00
              </li>
            </ul>
          </div>

          {/* Terhubung */}
          <div>
            <p className="eyebrow">Terhubung</p>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground/70">
              <li>
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-amber"
                >
                  <AtSign className="h-4 w-4 text-sage" aria-hidden="true" />
                  @ventora.coffee
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border-soft pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center">
          <p>© 2026 Ventora Coffee. Project belajar, bukan bisnis nyata.</p>
          <p className="font-data uppercase tracking-[0.16em]">Dibuat dengan Next.js</p>
        </div>
      </div>
    </footer>
  );
}
