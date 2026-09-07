"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { FirestoreProduct } from "@/lib/firestore-products";

interface RecommendedProductsProps {
  products: FirestoreProduct[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  return (
    <section id="menu" className="mx-auto max-w-screen-xl px-6 py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Rekomendasi</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Paling banyak disukai
          </h2>
        </div>
        <Link
          href="/menu"
          className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-amber"
        >
          Lihat semua menu
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpenModal={() => {}} />
        ))}
      </div>
    </section>
  );
}
