"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function KeranjangPage() {
  const { items, updateQty, removeItem, totalPrice, checkout } = useCart();
  const router = useRouter();

  function handleCheckout() {
    checkout();
    router.push("/pesanan");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Keranjang
        </p>
        <h1 className="mt-1 font-display text-4xl">Pesanan kamu</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border-soft p-10 text-center">
            <p className="text-foreground/70">Keranjang kamu masih kosong.</p>
            <Link
              href="/menu"
              className="mt-4 inline-block rounded-full bg-rust px-6 py-2.5 text-sm text-paper hover:opacity-90"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-dim text-2xl dark:bg-espresso">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{item.name}</p>
                    <p className="font-data text-sm text-foreground/60">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft hover:border-amber"
                      aria-label={`Kurangi ${item.name}`}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-data text-sm">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft hover:border-amber"
                      aria-label={`Tambah ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Hapus ${item.name}`}
                    className="ml-2 text-foreground/40 hover:text-rust"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border-soft pt-6">
              <span className="font-display text-xl">Total</span>
              <span className="font-data text-xl">{formatRupiah(totalPrice)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-full bg-rust py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Checkout Sekarang
            </button>
            <p className="mt-3 text-center text-xs text-foreground/50">
              Simulasi checkout, belum terhubung payment gateway beneran.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
