"use client";

import { useState } from "react";
import { Plus, Check, Star } from "lucide-react";
import type { Product } from "@/lib/dummy-products";
import { useCart } from "@/context/CartContext";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-border-soft bg-surface p-5 transition-colors hover:border-amber/70">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper-dim text-2xl dark:bg-espresso">
          {product.icon}
        </div>
        <span className="inline-flex items-center gap-1 font-data text-xs text-foreground/70">
          <Star className="h-3.5 w-3.5 fill-amber text-amber" aria-hidden="true" />
          {product.rating.toFixed(1)}
        </span>
      </div>

      <p className="eyebrow mt-4">{product.category}</p>
      <h4 className="mt-1.5 font-serif text-lg font-semibold tracking-tight">
        {product.name}
      </h4>
      <p className="mt-1.5 text-sm leading-6 text-foreground/60">
        {product.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-border-soft pt-4">
        <span className="font-data text-sm font-medium">
          {formatRupiah(product.price)}
        </span>
        <button
          onClick={handleAdd}
          aria-label={`Tambah ${product.name} ke keranjang`}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            justAdded
              ? "bg-sage text-paper"
              : "bg-espresso text-paper hover:bg-rust dark:bg-paper dark:text-espresso dark:hover:bg-amber dark:hover:text-espresso"
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Ditambahkan
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Tambah
            </>
          )}
        </button>
      </div>
    </article>
  );
}
