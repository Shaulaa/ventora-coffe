"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/reservasi", label: "Reservasi" },
  { href: "/pesanan", label: "Pesanan Saya" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight">
          Ventora&nbsp;Coffee
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/80 transition-colors hover:text-amber"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/keranjang"
            aria-label="Keranjang belanja"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border-soft transition-colors hover:border-amber"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1 font-data text-[10px] text-paper">
                {totalItems}
              </span>
            )}
          </Link>
          {!loading && !user && (
            <Link
              href="/login"
              className="rounded-full bg-rust px-5 py-2 text-sm text-paper transition-opacity hover:opacity-90"
            >
              Masuk
            </Link>
          )}
          {!loading && user && (
            <button
              onClick={() => signOut(auth)}
              className="rounded-full border border-border-soft px-5 py-2 text-sm transition-colors hover:border-amber"
            >
              Keluar
            </button>
          )}
          <button
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Buka menu navigasi"
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-border-soft px-6 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
