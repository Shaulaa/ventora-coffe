"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryTabs from "@/components/CategoryTabs";
import { products, categories } from "@/lib/dummy-products";

type Category = (typeof categories)[number];

export default function MenuPage() {
  const [active, setActive] = useState<Category>("Semua");

  const filtered = useMemo(() => {
    if (active === "Semua") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Menu digital
        </p>
        <h1 className="mt-1 font-display text-4xl">Semua yang kami sajikan</h1>
        <p className="mt-3 max-w-xl text-foreground/70">
          Keranjang belanja dan checkout masih dikerjakan di Fase 3. Untuk
          sekarang, ini pratinjau katalog produknya.
        </p>

        <div className="mt-8">
          <CategoryTabs active={active} onChange={setActive} />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
