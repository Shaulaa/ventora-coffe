"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { getProducts, FirestoreProduct } from "@/lib/firestore-products";
import { products as dummyProducts, categories } from "@/lib/dummy-products";
import { firebaseIsConfigured } from "@/lib/firebase";
import { Search, X, Coffee, IceCream, Cookie, Sparkles, Pizza, Cake, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { ProductCustomization } from "@/context/CartContext";

// Kategori baru dengan urutan yang diinginkan
const menuCategories = [
  { id: "signature", label: "Signature", icon: Star },
  { id: "klasik", label: "Kopi", icon: Coffee },
  { id: "nonkopi", label: "Non-Kopi", icon: IceCream },
  { id: "makanan", label: "Makanan", icon: Pizza },
  { id: "camilan", label: "Snack", icon: Cookie },
];

// Mapping kategori lama ke kategori baru
const categoryMap: Record<string, string> = {
  "Signature": "signature",
  "Klasik": "klasik",
  "Non-Kopi": "nonkopi",
  "Makanan": "makanan",
  "Camilan": "camilan",
};

type ProductData = FirestoreProduct;

export default function MenuPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const timeoutPromise = new Promise<FirestoreProduct[]>((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout")), 5000)
        );
        const data = firebaseIsConfigured
          ? await Promise.race([getProducts(), timeoutPromise])
          : (dummyProducts.map((p) => ({
              ...p,
              ratingAverage: p.rating,
              ratingCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            })) as FirestoreProduct[]);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat produk");
        setProducts(dummyProducts.map((p) => ({
          ...p,
          ratingAverage: p.rating,
          ratingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as FirestoreProduct[]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  function handleOpenModal(product: ProductData) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  function handleAddToCart(product: ProductData, customization: ProductCustomization, qty: number) {
    addItem(product, customization, qty);
    window.dispatchEvent(new CustomEvent("ventora:addToCart", {
      detail: { productId: product.id }
    }));
  }

  // Filter products based on search
  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Group products by category
  const groupedProducts = menuCategories.map((cat) => ({
    ...cat,
    items: filteredProducts.filter((p) => categoryMap[p.category] === cat.id),
  }));

  // Get total count per category
  const getCategoryCount = (catId: string) => {
    return products.filter((p) => categoryMap[p.category] === catId).length;
  };

  // Scroll to category section
  const scrollToCategory = (catId: string) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveCategory(catId);
      const element = document.getElementById(`category-${catId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden bg-surface px-4 pt-8 pb-6 dark:bg-espresso md:bg-gradient-to-b md:from-paper md:via-paper md:to-paper-dim md:dark:from-espresso md:dark:via-espresso md:dark:to-espresso">
        {/* Decorative blobs - hidden on mobile */}
        <div className="absolute -right-20 -top-20 hidden h-80 w-80 rounded-full bg-rust/10 blur-3xl md:block" />
        <div className="absolute -left-20 -bottom-20 hidden h-60 w-60 rounded-full bg-amber/10 blur-3xl md:block" />

        <div className="relative mx-auto max-w-screen-xl">
          {/* Header */}
          <div className="text-center">
            <p className="font-data text-[10px] uppercase tracking-[0.2em] text-rust md:text-xs md:tracking-[0.3em]">
              Menu Digital
            </p>
            <h1 className="mt-2 font-display text-2xl md:text-4xl lg:text-5xl">
              Semua yang Kami Sajikan
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60 md:mt-3">
              Kopi spesial, minuman segar, dan camilan lezat. Pilih favoritmu!
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-6 max-w-xl">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 transition-colors group-focus-within:text-rust md:left-4 md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="Cari minuman atau camilan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-transparent bg-surface py-3 pl-10 pr-10 text-sm shadow-lg transition-all focus:border-rust/50 focus:outline-none focus:ring-2 focus:ring-rust/10 dark:bg-espresso-light md:rounded-2xl md:py-4 md:pl-12 md:pr-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground/40 transition-colors hover:bg-rust/10 hover:text-rust md:right-4 md:p-1.5"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills - Sticky, Mobile Optimized */}
      <section className="sticky top-16 z-30 border-b border-border-soft bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide md:gap-2">
            <button
              onClick={() => {
                setActiveCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all md:px-5 md:py-2.5 md:text-sm ${
                activeCategory === null
                  ? "bg-rust text-paper shadow-lg shadow-rust/20"
                  : "bg-surface text-foreground/70 border border-border-soft hover:border-rust/30"
              }`}
            >
              Semua
            </button>
            {menuCategories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all md:px-4 md:py-2.5 md:text-sm ${
                    activeCategory === cat.id
                      ? "bg-rust text-paper shadow-lg shadow-rust/20"
                      : "bg-surface text-foreground/70 border border-border-soft hover:border-rust/30"
                  }`}
                >
                  <Icon className={`h-3 w-3 md:h-4 md:w-4 ${activeCategory === cat.id ? "text-paper/80" : "text-rust/70 group-hover:text-rust"}`} />
                  <span>{cat.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] md:rounded-full md:px-2 md:py-0.5 md:text-xs ${
                    activeCategory === cat.id ? "bg-paper/20" : "bg-foreground/10"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products by Category - Mobile Optimized */}
      <section className="mx-auto max-w-screen-xl px-4 py-6 md:px-6 md:py-8">
        {searchQuery && (
          <p className="mb-4 text-sm text-foreground/60 md:mb-6">
            Menampilkan <span className="font-semibold text-rust">{filteredProducts.length}</span> produk untuk &quot;{searchQuery}&quot;
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rust/20 bg-rust/5 p-3 text-sm text-rust md:mb-6 md:rounded-2xl md:p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8 md:space-y-12">
            {menuCategories.slice(0, 3).map((cat) => (
              <div key={cat.id}>
                <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">
                  <div className="h-6 w-24 animate-pulse rounded-lg bg-surface md:h-8 md:w-32" />
                  <div className="h-5 w-12 animate-pulse rounded-full bg-surface md:h-6 md:w-16" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-2xl bg-surface md:rounded-3xl" />
                      <div className="mt-3 h-5 w-3/4 rounded-lg bg-surface md:mt-4 md:h-6" />
                      <div className="mt-1.5 h-4 w-1/2 rounded-lg bg-surface md:mt-2 md:h-4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border-soft p-8 text-center md:rounded-3xl md:p-12">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rust/10 md:mb-4 md:h-16 md:w-16">
              <Search className="h-6 w-6 text-rust/50 md:h-8 md:w-8" />
            </div>
            <h3 className="font-display text-lg md:text-xl">Tidak ditemukan</h3>
            <p className="mt-1 text-sm text-foreground/60 md:mt-2">Coba kata kunci lain atau lihat semua menu</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 rounded-full bg-rust px-5 py-2 text-xs font-medium text-paper transition-colors hover:bg-rust/90 md:mt-4 md:px-6 md:py-2.5 md:text-sm"
              >
                Lihat Semua
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {groupedProducts.map((group) => {
              if (group.items.length === 0) return null;
              const Icon = group.icon;
              return (
                <div key={group.id} id={`category-${group.id}`}>
                  {/* Category Header */}
                  <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rust/10 md:h-12 md:w-12 md:rounded-xl">
                      <Icon className="h-5 w-5 text-rust md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg md:text-2xl">{group.label}</h2>
                      <p className="text-xs text-foreground/50 md:text-sm">{group.items.length} item</p>
                    </div>
                  </div>

                  {/* Products Grid - 2 columns on mobile, 4 on xl */}
                  <div className="grid gap-3 grid-cols-2 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpenModal={handleOpenModal}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom spacing */}
      <div className="h-16 md:h-20" />

      {/* Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
