"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart, type Order } from "@/context/CartContext";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTanggal(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const statusStyle: Record<Order["status"], string> = {
  diproses: "bg-amber/20 text-amber",
  siap: "bg-sage/20 text-sage",
  selesai: "bg-border-soft text-foreground/60",
};

export default function PesananPage() {
  const { orders } = useCart();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-data text-xs uppercase tracking-[0.3em] text-sage">
          Riwayat
        </p>
        <h1 className="mt-1 font-display text-4xl">Pesanan saya</h1>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border-soft p-10 text-center">
            <p className="text-foreground/70">Belum ada pesanan.</p>
            <Link
              href="/menu"
              className="mt-4 inline-block rounded-full bg-rust px-6 py-2.5 text-sm text-paper hover:opacity-90"
            >
              Mulai Pesan
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border-soft bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-data text-sm text-foreground/60">
                    {order.id}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-data text-xs capitalize ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  {formatTanggal(order.createdAt)}
                </p>

                <ul className="mt-3 space-y-1">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.icon} {item.name} × {item.qty}
                      </span>
                      <span className="font-data">
                        {formatRupiah(item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex justify-between border-t border-border-soft pt-3 font-display">
                  <span>Total</span>
                  <span className="font-data">{formatRupiah(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
