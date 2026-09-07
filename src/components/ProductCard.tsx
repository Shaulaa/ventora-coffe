"use client";

import Image from "next/image";
import { Star, Flame, Settings2 } from "lucide-react";
import type { FirestoreProduct } from "@/lib/firestore-products";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ProductCardProps {
  product: FirestoreProduct;
  onOpenModal: (product: FirestoreProduct) => void;
}

// Category gradient colors
const categoryGradients: Record<string, string> = {
  Signature: "from-amber-500 to-orange-600",
  Klasik: "from-espresso to-espresso-light",
  "Non-Kopi": "from-sage to-emerald-600",
  Makanan: "from-rust to-red-600",
  Camilan: "from-amber-400 to-yellow-500",
};

export default function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const rating = "ratingAverage" in product
    ? product.ratingAverage
    : (product as { rating?: number }).rating ?? 0;
  const ratingCount = "ratingCount" in product ? product.ratingCount : 0;

  function handleOpenCustomization(e: React.MouseEvent) {
    e.stopPropagation();
    onOpenModal(product);
  }

  const isSignature = product.category === "Signature";
  const gradient = categoryGradients[product.category] || "from-rust to-amber-500";

  return (
    <article
      onClick={() => onOpenModal(product)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border-soft bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-border-soft/50 sm:rounded-2xl"
    >
      {/* Image/Icon Area */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} sm:h-36`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/80 sm:text-5xl">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute inset-x-0 top-2 flex items-start justify-between px-2 sm:inset-x-0 sm:top-3 sm:px-3">
          <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
            {product.category}
          </span>
          {ratingCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-black/40 px-1 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-2 sm:py-1 sm:text-xs">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 sm:h-3 sm:w-3" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Signature Badge */}
        {isSignature && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-rust backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            <Flame className="h-2.5 w-2.5 fill-orange-500 text-orange-500 sm:h-3 sm:w-3" />
            Signature
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-surface p-3 dark:bg-espresso-light sm:p-4">
        <h4 className="font-display text-sm font-semibold tracking-tight transition-colors group-hover:text-rust sm:text-lg">
          {product.name}
        </h4>

        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-foreground/60 sm:mt-1.5 sm:text-xs">
          {product.description}
        </p>

        <div className="mt-2.5 flex items-center justify-between sm:mt-4">
          <span className="font-display text-sm font-bold text-rust sm:text-lg">
            {formatRupiah(product.price)}
          </span>

          {/* Tombol Customization */}
          <button
            onClick={handleOpenCustomization}
            className="flex items-center gap-1 rounded-full bg-rust px-2 py-1 text-[10px] font-semibold text-paper transition-all hover:bg-rust/90 sm:gap-2 sm:rounded-full sm:bg-rust sm:px-4 sm:py-2 sm:text-xs"
          >
            <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Pilih</span>
          </button>
        </div>
      </div>
    </article>
  );
}
