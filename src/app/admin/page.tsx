"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  ClipboardList,
  CalendarCheck,
  Star,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    reservations: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [productsSnap, ordersSnap, reservationsSnap, reviewsSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "reservations")),
        getDocs(collection(db, "reviews")),
      ]);

      setStats({
        products: productsSnap.size,
        orders: ordersSnap.size,
        reservations: reservationsSnap.size,
        reviews: reviewsSnap.size,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      label: "Menu",
      value: stats.products,
      icon: ShoppingBag,
      href: "/admin/products",
      color: "rust",
    },
    {
      label: "Pesanan",
      value: stats.orders,
      icon: ClipboardList,
      href: "/admin/orders",
      color: "amber",
    },
    {
      label: "Reservasi",
      value: stats.reservations,
      icon: CalendarCheck,
      href: "/admin/reservations",
      color: "sage",
    },
    {
      label: "Ulasan",
      value: stats.reviews,
      icon: Star,
      href: "/admin/reviews",
      color: "purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl">Dashboard Kasir</h1>
        <p className="mt-1 text-foreground/60">
          Selamat datang, {user?.email?.split("@")[0]}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-all hover:border-rust/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-5xl">
                  {loading ? "-" : stat.value}
                </p>
              </div>
              <div
                className={`rounded-2xl bg-${stat.color}/10 p-3`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
            </div>
            <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-foreground/30 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/orders"
          className="group flex items-center gap-4 rounded-2xl border border-rust/30 bg-rust/5 p-6 transition-colors hover:bg-rust/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rust text-white">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-lg">Kelola Pesanan</h3>
            <p className="text-sm text-foreground/60">
              Lihat dan update status pesanan masuk
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-foreground/30 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/admin/reservations"
          className="group flex items-center gap-4 rounded-2xl border border-sage/30 bg-sage/5 p-6 transition-colors hover:bg-sage/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage text-white">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-lg">Kelola Reservasi</h3>
            <p className="text-sm text-foreground/60">
              Konfirmasi atau tolak reservasi meja
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-foreground/30 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-border-soft bg-surface p-6">
        <h3 className="font-display text-lg">Panduan Singkat</h3>
        <div className="mt-4 grid gap-4 text-sm text-foreground/70 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/20 text-xs font-bold text-amber">
              1
            </span>
            <p>Pesanan masuk muncul real-time</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/20 text-xs font-bold text-amber">
              2
            </span>
            <p>Klik pesanan untuk ubah status</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/20 text-xs font-bold text-amber">
              3
            </span>
            <p>Status: Menunggu ke Siap</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/20 text-xs font-bold text-amber">
              4
            </span>
            <p>Customer bisa batalkan pesanan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
