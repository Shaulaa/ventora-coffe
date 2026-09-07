import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReviewForm from "@/components/ReviewForm";
import RelatedProducts from "@/components/RelatedProducts";
import ProductCard from "@/components/ProductCard";
import { getProductById, getProductsByCategory, FirestoreProduct } from "@/lib/firestore-products";
import { RatingDisplay } from "@/components/Rating";
import { notFound } from "next/navigation";

async function getProductOrNotFound(id: string): Promise<FirestoreProduct> {
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }
  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductOrNotFound(params.id);
  const relatedProducts = await getProductsByCategory(product.category);

  // Dummy handler - modal won't work on server component
  const handleOpenModal = () => {};

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <nav className="flex items-center gap-2 text-sm text-foreground/60">
          <Link href="/menu" className="hover:text-rust transition-colors">
            Menu
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-3xl bg-paper-dim p-8 dark:bg-espresso-light">
            <div className="text-9xl">{product.icon}</div>
          </div>

          <div>
            <span className="font-data text-xs uppercase tracking-[0.3em] text-sage">
              {product.category}
            </span>
            <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="font-data text-3xl font-medium">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs font-medium text-amber border border-amber/20 dark:bg-espresso dark:border-amber/30">
                <span className="text-amber">★</span>
                {product.ratingAverage.toFixed(1)} ({product.ratingCount} ulasan)
              </span>
            </div>

            <p className="mt-6 text-lg leading-7 text-foreground/70">
              {product.description}
            </p>

            <div className="mt-8">
              <ProductCard product={product} onOpenModal={handleOpenModal} />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border-soft pt-12">
          <h2 className="font-display text-2xl">Ulasan</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-paper p-6 dark:bg-espresso-light">
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-medium">
                    {product.ratingAverage.toFixed(1)}
                  </span>
                  <RatingDisplay rating={product.ratingAverage} />
                </div>
                <p className="mt-2 text-sm text-foreground/60">
                  Dari {product.ratingCount} ulasan
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <ReviewForm productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>

        <RelatedProducts category={product.category} products={relatedProducts} currentProductId={product.id} />
      </section>
    </div>
  );
}
