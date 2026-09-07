"use client";

import ProductCard from "./ProductCard";
import type { FirestoreProduct } from "@/lib/firestore-products";

interface RelatedProductsProps {
  category: string;
  products: FirestoreProduct[];
  currentProductId: string;
}

export default function RelatedProducts({
  category,
  products,
  currentProductId,
}: RelatedProductsProps) {
  return (
    <div className="mt-16 border-t border-border-soft pt-12">
      <h2 className="font-display text-2xl">Produk {category} Lainnya</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products
          .filter((p) => p.id !== currentProductId)
          .slice(0, 3)
          .map((product) => (
            <ProductCard key={product.id} product={product} onOpenModal={() => {}} />
          ))}
      </div>
    </div>
  );
}
