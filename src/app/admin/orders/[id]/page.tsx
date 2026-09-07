"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "@/components/Navbar";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  icon?: string;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
};

const statusOptions = [
  { value: "menunggu", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "siap", label: "Siap" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export default function AdminOrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!params.id) return;
      try {
        const docRef = doc(db, "orders", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({
            id: docSnap.id,
            userId: data.userId,
            items: data.items || [],
            total: data.total,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        }
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params.id]);

  async function handleUpdateStatus(status: string) {
    if (!order) return;
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setOrder({ ...order, status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-center py-12">
            <p className="animate-pulse text-foreground/60">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center">Order tidak ditemukan.</p>
          <Link href="/admin/orders" className="mt-4 block text-center text-rust">
            Kembali ke daftar pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl">Detail Pesanan</h2>
            <p className="mt-2 text-foreground/70">{order.id}</p>
          </div>
          <Link
            href="/admin/orders"
            className="rounded-full border border-border-soft px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            Kembali ke Daftar Pesanan
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Status Card */}
          <div className="rounded-2xl border border-border-soft bg-surface p-6">
            <h3 className="font-display text-lg">Status Pesanan</h3>
            <p className="mt-2 text-foreground/70">
              Ubah status pesanan untuk memberi tahu pelanggan.
            </p>

            <select
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="mt-6 w-full rounded-xl border border-border-soft bg-background px-4 py-3 font-body text-sm focus:border-rust/50 focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Details */}
          <div className="rounded-2xl border border-border-soft bg-surface p-6 lg:col-span-2">
            <h3 className="font-display text-lg">Detail Pesanan</h3>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between border-b border-border-soft pb-4">
                <span className="text-foreground/60">ID Pesanan</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between border-b border-border-soft pb-4">
                <span className="text-foreground/60">Pelanggan</span>
                <span>{order.userId}</span>
              </div>
              <div className="flex justify-between border-b border-border-soft pb-4">
                <span className="text-foreground/60">Tanggal</span>
                <span>
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border-soft pb-4">
                <span className="text-foreground/60">Jumlah Items</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex justify-between border-b border-border-soft pb-4">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-mono">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-6 rounded-2xl border border-border-soft bg-surface p-6">
          <h3 className="font-display text-lg">Items Pesanan</h3>
          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border-b border-border-soft pb-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon || "☕"}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-foreground/60">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </p>
                  </div>
                </div>
                <div className="font-mono">x{item.qty}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end border-t border-border-soft pt-4">
            <span className="font-display text-xl">Total</span>
            <span className="ml-2 font-mono text-xl">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
